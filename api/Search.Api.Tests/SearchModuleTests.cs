using System.Collections.Generic;
using System.Collections.ObjectModel;
using Containers;
using Moq;
using NUnit.Framework;
using Nancy;
using Nancy.Testing;
using Newtonsoft.Json.Linq;
using Search.Api.Config;
using Search.Api.Services;

namespace Search.Api.Tests {
    public class SearchModuleTests {
        [TestFixture]
        public class Routing {
            [SetUp]
            public void Setup() {
                var serviceMoq = new Mock<IQuerySoeService>();
                var result =
                    new ResponseContainer<Dictionary<int, JObject>>(
                        new Dictionary<int, JObject> {
                            {
                                1, new JObject()
                            }
                        });

                serviceMoq.Setup(x => x.Query(It.IsAny<Dictionary<string, string>>(), false))
                          .ReturnsAsync(result);

                var bootstrapper = new ConfigurableBootstrapper(cfg => {
                    cfg.Dependency(serviceMoq.Object);
                    cfg.Module<SearchModule>();
                    cfg.Module<HomeModule>();
                    cfg.ApplicationStartup((_, __) => AutoMapperConfig.RegisterMaps());
                    cfg.RootPathProvider<UnitTestRootPathProvider>();
                });

                _browser = new Browser(bootstrapper);
            }

            private Browser _browser;

            [Test]
            public void CanRouteToHome() {
                // When
                var result = _browser.Get("/", with => with.HttpRequest());

                // Then
                Assert.That(result.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            }

            [Test]
            public void CanRouteToSearch() {
                // When
                var result = _browser.Post("/search", with => {
                    with.Body("{\"queryLayers\": [{\"id\": 2 }]}");
                    with.Header("Content-Type", "application/json");
                    with.Header("Accept", "application/json");
                });

                // Then
                Assert.That(result.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            }
        }
    }
}
