using Crafts.Models;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Crafts.Services
{

    //Snippet herfra: https://gist.github.com/bradygaster/3d1fcf43d1d1e73ea5d6c1b5aab40130#file-jsonfileproductservice-cs
    public class JsonFileBlogindlaegService
    {
        public JsonFileBlogindlaegService(IWebHostEnvironment webHostEnvironment)
        {
            WebHostEnvironment = webHostEnvironment;
        }

        //Hjælper med at gemme stien (WebRootPath)
        public IWebHostEnvironment WebHostEnvironment { get; }

        private string JsonFileName
        {
            get { return Path.Combine(WebHostEnvironment.WebRootPath, "data", "Blogindlaeg.json"); }
        }


        //IEnumerable er ting man kan foreache på
        public IEnumerable<Blogindlaeg> GetBlogindlaeg()
        {
            using (var jsonFileReader = File.OpenText(JsonFileName))
            {
                //Sæt det sammen igen
                return JsonSerializer.Deserialize<Blogindlaeg[]>(jsonFileReader.ReadToEnd(),
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
            }
        }

        //Funktion: Rating af læserne
        public void TilfoejBedoemelse(int indlaegsID, int rating)
        {
            var blogindlaeg = GetBlogindlaeg();

            //LINQ
            var query = blogindlaeg.First(x => x.Id == indlaegsID);

            if (query.Ratings == null)
            {
                //Hvis der ikke er noget, så skal der laves et nyt int[] baseret på den rating der gives
                query.Ratings = new int[] { rating };
            }
            else
            {
                var ratings = query.Ratings.ToList();
                ratings.Add(rating);
                query.Ratings = ratings.ToArray();

            }

            //Hvis der ikke er en rating i JSON-filen skal den oprettes
            using (var outputStream = File.OpenWrite(JsonFileName))
            {
                JsonSerializer.Serialize<IEnumerable<Blogindlaeg>>(
                    new Utf8JsonWriter(outputStream, new JsonWriterOptions
                    {
                        SkipValidation = true,
                        Indented = true
                    }),
                    blogindlaeg
                );
            }

        }



    }
}
 