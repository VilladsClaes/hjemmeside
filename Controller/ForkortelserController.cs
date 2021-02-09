using Crafts.Models;
using Crafts.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Crafts.Controller
{
    [Route("[controller]")]
    [ApiController]
    public class ForkortelserController : ControllerBase
    {
        //Kontruktor
       public ForkortelserController(JsonFileForkortelseService jsonFileForkortelse)
        {
            this.ForkortelsesService = jsonFileForkortelse;
        }

        public  JsonFileForkortelseService ForkortelsesService { get; }

        [HttpGet]
        public IEnumerable<Forkortelse> Get()
        {
            return ForkortelsesService.GetForkortelser();
        }


    }
}
