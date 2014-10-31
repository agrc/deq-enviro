using NUnit.Framework;
using Search.Api.Models.Soe;
using Search.Api.Serializers;

namespace Search.Api.Tests
{
    [TestFixture]
    public class FormUrlTest
    {
        [Test]
        public void ParsesDefinitionQueries()
        {
            var request = new SoeSearchRequest {
                DefinitionQueries = new []{null, "blah"},
                LayerIds = new[]{1,2}
            };

            var actual = FormUrl.CreateObjects(request);

            var layerIds = actual[0];
            var definitionQuery = actual[1];

            Assert.That(definitionQuery.Value, Is.EqualTo("[\"\",\"blah\"]"));
            Assert.That(layerIds.Value, Is.EqualTo("[1,2]"));
        }
    }
}
