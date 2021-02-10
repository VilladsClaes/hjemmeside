using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Crafts.Models
{
    public class Blogindlaeg
    {

        public int Id { get; set; }

        [JsonPropertyName("Skrevet af")]
        public string Forfatter { get; set; }


        [JsonPropertyName("Udgivelsesdato")]
        public DateTime  Udgivelsesdato { get; set; }


        public int[] Ratings { get; set; }



        [JsonPropertyName("Overskrift")]
        public string BlogindlaegOverskrift { get; set; }


        [JsonPropertyName("Tekst")]
        public string BlogindlaegTekst { get; set; }

        public string Billede { get; set; }






        public override string ToString() => JsonSerializer.Serialize<Blogindlaeg>(this);
        
    }
}




