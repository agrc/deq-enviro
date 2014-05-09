using Newtonsoft.Json;

namespace EsriJson.Net.Geometry
{
    [JsonObject(MemberSerialization.OptIn)]
    public class Point : EsriJsonObject
    {
        public Point(double x, double y)
        {
            X = x;
            Y = y;
        }

        [JsonProperty(PropertyName = "x", Required = Required.Always)]
        public double X { get; set; }

        [JsonProperty(PropertyName = "y", Required = Required.Always)]
        public double Y { get; set; }

        public bool Equals(Point obj)
        {
            return obj != null && obj.X == X && obj.Y == Y;
        }

        public override string Type { get { return "point"; } }
    }
}