using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Search.Api.Serializers {
    public sealed class JsonSerializerOptions : JsonSerializer {
        public JsonSerializerOptions() {
            ContractResolver = new CamelCasePropertyNamesContractResolver();
        }
    }
}
