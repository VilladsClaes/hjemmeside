using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Crafts.Models
{
    public class Forkortelse
    {

        [JsonPropertyName("abbr")]
        public string Forkortes { get; set; }


        [JsonPropertyName("origin")]
        public string  Oprindelse { get; set; }


        public override string ToString() => JsonSerializer.Serialize<Forkortelse>(this);
        
    }
}
