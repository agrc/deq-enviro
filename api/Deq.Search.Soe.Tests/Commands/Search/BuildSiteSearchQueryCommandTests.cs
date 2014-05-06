using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Commands.Searches;
using Deq.Search.Soe.Models.Configuration;
using NUnit.Framework;

namespace Deq.Search.Soe.Tests.Commands.Search {
    [TestFixture]
    public class BuildSiteSearchQueryCommandTests {
        [SetUp]
        public void SetupFixture() {
            ApplicationCache.Fields = new ApplicationFieldSettings {
                SiteName = "SN"
            };
        }

        [Test]
        public void QueryStringIsFormattedCorrectlyForMatchAll() {
            var command = new BuildSiteSearchQueryCommand("i am terms", true);
            command.Run();

            Assert.That(command.Result,
                        Is.EqualTo("SN LIKE upper('%i%') AND SN LIKE upper('%am%') AND SN LIKE upper('%terms%')"));
        }

        [Test]
        public void QueryStringIsFormattedCorrectlyForMatchSome() {
            var command = new BuildSiteSearchQueryCommand("i am terms", false);
            command.Run();

            Assert.That(command.Result,
                        Is.EqualTo("SN LIKE upper('%i%') OR SN LIKE upper('%am%') OR SN LIKE upper('%terms%')"));
        }
    }
}
