using System.Collections.Generic;
using EsriJson.Net.Geometry;
using Newtonsoft.Json;

namespace EsriJson.Net.Graphic
{
    public class Graphic : IGeometry
    {
        public Graphic(EsriJsonObject geometry, Dictionary<string, object> attributes)
        {
            Attributes = attributes;
            Geometry = geometry;
        }

        [JsonProperty(PropertyName = "attributes", Required = Required.AllowNull)]
        public Dictionary<string, object> Attributes { get; private set; }

        [JsonProperty(PropertyName = "geometry", Required = Required.AllowNull)]
        public EsriJsonObject Geometry { get; set; }
    }
}