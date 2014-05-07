using System.Collections.Generic;
using Deq.Search.Soe.Commands.Searches;
using Deq.Search.Soe.Models.Search;
using Deq.Search.Soe.Tests.Extensions;
using NUnit.Framework;

namespace Deq.Search.Soe.Tests.Commands.Search {
    public class BuildLayerPropertiesCommandTests {
        [Test]
        public void ZipsLayerIdAndDefinitionQueryTogether() {
            var ids = new object[] {
                1, 5
            };
            var queries = new object[] {
                "1", "5"
            };

            var command = new BuildLayerPropertiesCommand(ids, queries);
            command.Run();

            command.Result.CollectionAsJsonAreEqual(new List<SearchLayerProperties> {
                new SearchLayerProperties(1, "1"),
                new SearchLayerProperties(5, "5")
            });
        }

        [Test]
        public void ZipsLayerIdAndDefinitionQueryTogetherWithNulls() {
            var ids = new object[] {
                1, 5
            };
            var queries = new object[] {
                null, "5", null
            };

            var command = new BuildLayerPropertiesCommand(ids, queries);
            command.Run();

            command.Result.CollectionAsJsonAreEqual(new List<SearchLayerProperties> {
                new SearchLayerProperties(1, null),
                new SearchLayerProperties(5, "5")
            });
        }
    }
}
