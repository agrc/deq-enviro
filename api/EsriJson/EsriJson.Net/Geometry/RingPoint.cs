using EsriJson.Net.Geometry.Converters;
using Newtonsoft.Json;

namespace EsriJson.Net.Geometry
{
    [JsonObject(MemberSerialization.OptIn)]
    [JsonConverter(typeof(RingPointConverter))]
    public class RingPoint
    {
        public double X { get; set; }

        public double Y { get; set; }

        public RingPoint(double x, double y)
        {
            X = x;
            Y = y;
        }

        public bool Equals(RingPoint obj)
        {
            return obj != null && obj.X == X && obj.Y == Y;
        }
    }
}