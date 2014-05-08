using System;
using Newtonsoft.Json;

namespace EsriJson.Net.Geometry.Converters
{
    public class RingPointConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            writer.WriteStartArray();
            writer.WriteValue(((RingPoint)value).X);
            writer.WriteValue(((RingPoint)value).Y);
            writer.WriteEndArray();
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            return null;
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof (RingPoint);
        }
    }
}