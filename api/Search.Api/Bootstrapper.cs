using System.Net;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.TinyIoc;
using Newtonsoft.Json;
using Raven.Client;
using Raven.Client.Document;
using Search.Api.Config;
using Search.Api.Index;
using Search.Api.Serializers;
using Search.Api.Services;

namespace Search.Api {
    public class Bootstrapper : DefaultNancyBootstrapper {
        // The bootstrapper enables you to reconfigure the composition of the framework,
        // by overriding the various methods and properties.
        // For more information https://github.com/NancyFx/Nancy/wiki/Bootstrapper
        public Bootstrapper()
        {
            // Configure Store to point to your external RavenDB instance.  
            // For simpliclity, we'll use an embedded instance instead
            Store = new DocumentStore
                {
                    ConnectionStringName = "RavenDb"
                }.Initialize();

            Store.JsonRequestFactory.ConfigureRequest +=
                (sender, args) =>
                    {
                        args.Request.PreAuthenticate = true;
                        ((HttpWebRequest) args.Request).UnsafeAuthenticatedConnectionSharing = true;
                    };

            RavenConfig.Register(typeof (UserByIdIndex), Store);
        }

        public virtual IDocumentStore Store { get; private set; }

        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            base.ApplicationStartup(container, pipelines);

            AutoMapperConfig.RegisterMaps();
        }

        protected override void ConfigureApplicationContainer(TinyIoCContainer container)
        {
            base.ConfigureApplicationContainer(container);

            container.Register(typeof (JsonSerializer), typeof (JsonSerializerOptions));
            container.Register<IQuerySoeService>(new QuerySoeServiceAsync());
        }

        protected override void ConfigureRequestContainer(TinyIoCContainer container, NancyContext context)
        {
            base.ConfigureRequestContainer(container, context);
            container.Register(Store.OpenSession());
        }
    }
}