using Nancy;
using Nancy.Bootstrapper;
using Nancy.TinyIoc;
using Newtonsoft.Json;
using Search.Api.Config;
using Search.Api.Serializers;
using Search.Api.Services;

namespace Search.Api {
    public class Bootstrapper : DefaultNancyBootstrapper {
        // The bootstrapper enables you to reconfigure the composition of the framework,
        // by overriding the various methods and properties.
        // For more information https://github.com/NancyFx/Nancy/wiki/Bootstrapper
        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines) {
            base.ApplicationStartup(container, pipelines);

            AutoMapperConfig.RegisterMaps();
        }

        protected override void ConfigureApplicationContainer(TinyIoCContainer container) {
            base.ConfigureApplicationContainer(container);

            container.Register(typeof (JsonSerializer), typeof (JsonSerializerOptions));
            container.Register<IQuerySoeService>(new QuerySoeServiceAsync());
        }
    }
}
