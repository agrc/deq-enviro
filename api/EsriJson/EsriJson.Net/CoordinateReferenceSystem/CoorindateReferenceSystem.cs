using Newtonsoft.Json;

namespace EsriJson.Net.CoordinateReferenceSystem
{
    [JsonObject(MemberSerialization.OptIn)]
    public class CRS
    {
        [JsonProperty(PropertyName = "wkid")]
        public int WellKnownId { get; set; }
    }
}