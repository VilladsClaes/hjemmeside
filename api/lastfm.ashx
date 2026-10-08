<%@ WebHandler Language="C#" Class="LastFm" %>
<%@ Assembly Name="System.Web.Extensions, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35" %>

// Henter mine seneste scrobbles fra Last.fm og sender en kort, ren JSON-version videre til forsiden.
// API-nøglen ligger i App_Data/lastfm-noegle.txt, som GitHub Actions skriver ud fra secret'en LASTFM_API_KEY.
// IIS udleverer aldrig filer fra App_Data, så nøglen kan ikke hentes af besøgende.
// Svaret gemmes i 20 sekunder, så Last.fm ikke bliver kaldt for hver eneste besøgende.
// Webhotellet kører .NET Framework og oversætter filen selv, så koden holder sig til C# 5.

using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Caching;
using System.Web.Script.Serialization;

public class LastFm : IHttpHandler
{
  const string Bruger = "villadsclaes";
  const int Antal = 8;
  const int CacheSekunder = 20;
  // Last.fm bruger dette billede, når et album ikke har et omslag. Så viser vi hellere vores eget.
  const string TomtOmslag = "2a96cbd8b46e442fc41c2b86b821562f";
  const string FriskNoegle = "lastfm-frisk";
  const string GammelNoegle = "lastfm-gammel";

  public bool IsReusable { get { return true; } }

  public void ProcessRequest(HttpContext context)
  {
    var res = context.Response;
    res.ContentType = "application/json";
    res.ContentEncoding = Encoding.UTF8;
    res.Cache.SetCacheability(HttpCacheability.NoCache);
    res.AddHeader("X-Content-Type-Options", "nosniff");

    var cache = HttpRuntime.Cache;
    var frisk = cache[FriskNoegle] as string;
    if (frisk != null) { res.Write(frisk); return; }

    var noegleFil = context.Server.MapPath("~/App_Data/lastfm-noegle.txt");
    var noegle = File.Exists(noegleFil) ? File.ReadAllText(noegleFil).Trim() : "";
    if (noegle == "") { Fejl(res, 500, "API-nøglen mangler"); return; }

    string json;
    try
    {
      json = Hent(noegle);
    }
    catch (Exception)
    {
      // Hvis Last.fm driller, viser vi hellere lidt gamle data end ingenting
      var gammel = cache[GammelNoegle] as string;
      if (gammel != null) { res.Write(gammel); return; }
      Fejl(res, 502, "Kunne ikke hente fra Last.fm");
      return;
    }

    cache.Insert(FriskNoegle, json, null, DateTime.UtcNow.AddSeconds(CacheSekunder), Cache.NoSlidingExpiration);
    cache.Insert(GammelNoegle, json, null, DateTime.UtcNow.AddDays(1), Cache.NoSlidingExpiration);
    res.Write(json);
  }

  static string Hent(string noegle)
  {
    // Ældre .NET bruger ikke TLS 1.2 af sig selv, og det kræver Last.fm
    ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls12;

    var url = "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json" +
      "&user=" + Uri.EscapeDataString(Bruger) + "&limit=" + Antal + "&api_key=" + Uri.EscapeDataString(noegle);
    var req = (HttpWebRequest)WebRequest.Create(url);
    req.Timeout = 6000;
    req.UserAgent = "mig.villadsclaes.dk";

    string raa;
    using (var svar = (HttpWebResponse)req.GetResponse())
    using (var laeser = new StreamReader(svar.GetResponseStream(), Encoding.UTF8))
    {
      raa = laeser.ReadToEnd();
    }
    return Omsaet(raa);
  }

  // Gør Last.fms store svar om til den korte form, som js/main.js forventer
  public static string Omsaet(string raa)
  {
    var serializer = new JavaScriptSerializer();
    var data = serializer.DeserializeObject(raa) as IDictionary<string, object>;
    var recent = Felt(data, "recenttracks") as IDictionary<string, object>;
    var spor = Felt(recent, "track");
    if (spor is IDictionary<string, object>) spor = new object[] { spor }; // ét enkelt nummer kommer ikke som liste
    var liste = spor as IEnumerable;
    if (liste == null) throw new InvalidDataException("Uventet svar fra Last.fm");

    var ud = new List<object>();
    foreach (var element in liste)
    {
      var t = element as IDictionary<string, object>;
      if (t == null) continue;
      if (ud.Count == Antal) break;

      // Billederne kommer fra lille til stor. Tag det største, der findes
      var billede = "";
      var billeder = Felt(t, "image") as IEnumerable;
      if (billeder != null)
      {
        foreach (var b in billeder)
        {
          var src = Tekst(b as IDictionary<string, object>, "#text");
          if (src != "") billede = src;
        }
      }
      if (billede.Contains(TomtOmslag)) billede = "";

      var attr = Felt(t, "@attr") as IDictionary<string, object>;
      long tid;
      long.TryParse(Tekst(Felt(t, "date") as IDictionary<string, object>, "uts"), out tid);

      ud.Add(new Dictionary<string, object> {
        { "titel", Tekst(t, "name") },
        { "kunstner", Tekst(Felt(t, "artist") as IDictionary<string, object>, "#text") },
        { "album", Tekst(Felt(t, "album") as IDictionary<string, object>, "#text") },
        { "billede", billede },
        { "url", Tekst(t, "url") },
        { "nu", attr != null && attr.ContainsKey("nowplaying") },
        { "tid", tid },
      });
    }

    return serializer.Serialize(new Dictionary<string, object> { { "bruger", Bruger }, { "spor", ud } });
  }

  static object Felt(IDictionary<string, object> d, string navn)
  {
    object v;
    return d != null && d.TryGetValue(navn, out v) ? v : null;
  }

  static string Tekst(IDictionary<string, object> d, string navn)
  {
    var v = Felt(d, navn);
    return v == null ? "" : Convert.ToString(v);
  }

  static void Fejl(HttpResponse res, int status, string besked)
  {
    res.StatusCode = status;
    res.TrySkipIisCustomErrors = true;
    res.Write(new JavaScriptSerializer().Serialize(new Dictionary<string, string> { { "fejl", besked } }));
  }
}
