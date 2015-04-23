using Newtonsoft.Json;

namespace EsriJson.Net.Geometry {
    [JsonObject(MemberSerialization.OptIn)]
    public class Extent : EsriJsonObject {
        [JsonProperty(PropertyName = "xmax")] 
        public double Xmax;
        
        [JsonProperty(PropertyName = "xmin")] 
        public double Xmin;
        
        [JsonProperty(PropertyName = "ymax")] 
        public double Ymax;
        
        [JsonProperty(PropertyName = "ymin")] 
        public double Ymin;

        public Extent(double xmin, double ymin, double xmax, double ymax)
        {
            Xmin = xmin;
            Ymin = ymin;
            Xmax = xmax;
            Ymax = ymax;
        }

        public override string Type
        {
            get { return "extent"; }
        }
    }
}