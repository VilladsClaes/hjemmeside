using Crafts.Models;
using Crafts.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Crafts.Pages
{
    public class IndexModel : PageModel
    {
        //Variabler
        private readonly ILogger<IndexModel> _logger;
        public JsonFileForkortelseService ForkortelseService;

        //Lister
        public IEnumerable<Forkortelse> Forkortelser { get; private set; }

        //Hvad fanden er en logger?
        //Contructor?
        
        public IndexModel(ILogger<IndexModel> logger, JsonFileForkortelseService forkortelseService)
        {
            //Tildel variablerne det constructede
            //Hvis ikke det instantieres får man en fejl
            _logger = logger;
            ForkortelseService = forkortelseService;
        }

        public void OnGet()
        {
            Forkortelser = ForkortelseService.GetForkortelser();
        }
    }
}
