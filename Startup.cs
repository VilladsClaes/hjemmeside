using Crafts.Models;
using Crafts.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Crafts
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages();

            //Brug af BlazorKomponenter
            services.AddServerSideBlazor();
            //Hvis man tilføjer og vil bruge Controllers, skal man lige indlæse den dependency
            services.AddControllers();
            //Transient er en ting som kommer og går
            services.AddTransient<JsonFileForkortelseService>();
            services.AddTransient<JsonFileBlogindlaegService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

           //Hvad er forskellen på endpoints og routing?
            app.UseEndpoints(endpoints =>
            {
                //Hvis man går til /Privacy bruges Razorpagen Privacy.cshtml
                endpoints.MapRazorPages();

                //Hvis man kræver HttpGet og skriver /forkortelser

                //Nedenstående er flyttet til en ForkortelsesController, fordi "seperation of concerns"
                //endpoints.MapGet("/forkortelser", (context) =>
                //{
                //    var forkortelser = app.ApplicationServices.GetService<JsonFileForkortelseService>().GetForkortelser();
                //    var json = JsonSerializer.Serialize<IEnumerable<Forkortelse>>(forkortelser);
                //    return context.Response.WriteAsync(json);


                //Hvis man vil bruge Controllers til at route
                endpoints.MapControllers();

                //Brug af BlazorKomponenter
                endpoints.MapBlazorHub();


                //});
            });
        }
    }
}
