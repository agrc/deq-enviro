using Newtonsoft.Json;

namespace Search.Api.Serializers {
    public sealed class JsonSerializerOptions : JsonSerializer {
        public JsonSerializerOptions() {
            //ContractResolver = new CamelCasePropertyNamesContractResolver();
            NullValueHandling = NullValueHandling.Ignore;
        }
    }
}
