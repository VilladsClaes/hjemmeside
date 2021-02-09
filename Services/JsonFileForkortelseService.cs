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
    public class JsonFileForkortelseService
    {
        public JsonFileForkortelseService(IWebHostEnvironment webHostEnvironment)
        {
            WebHostEnvironment = webHostEnvironment;
        }

        //Hjælper med at gemme stien (WebRootPath)
        public IWebHostEnvironment WebHostEnvironment { get; }

        private string JsonFileName
        {
            get { return Path.Combine(WebHostEnvironment.WebRootPath, "data", "forkortelser.json"); }
        }


        //IEnumerable er ting man kan foreache på
        public IEnumerable<Forkortelse> GetForkortelser()
        {
            using (var jsonFileReader = File.OpenText(JsonFileName))
            {
                //Sæt det sammen igen
                return JsonSerializer.Deserialize<Forkortelse[]>(jsonFileReader.ReadToEnd(),
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
            }
        }
    }
}
 