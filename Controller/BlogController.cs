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
    public class BlogController : ControllerBase
    {
        //Kontruktor
       public BlogController(JsonFileBlogindlaegService jsonFileBlogindlaeg)
        {
            this.blogindlaegService = jsonFileBlogindlaeg;
        }

        public JsonFileBlogindlaegService blogindlaegService { get; }

        [HttpGet]
        public IEnumerable<Blogindlaeg> Get()
        {
            return blogindlaegService.GetBlogindlaeg();
        }

        //[HttpPatch] "[FromBody]"
        [Route("Rate")]
        [HttpGet]
        public ActionResult Get([FromQuery] int blogindlaegID, [FromQuery] int Rating )
        {
            blogindlaegService.TilfoejBedoemelse(blogindlaegID, Rating);
            return Ok();
        }


    }
}
