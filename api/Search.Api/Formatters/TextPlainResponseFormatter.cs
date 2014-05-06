using System.Net.Http.Formatting;
using System.Net.Http.Headers;

namespace Search.Api.Formatters {
    public class TextPlainResponseFormatter : JsonMediaTypeFormatter {
        public TextPlainResponseFormatter() {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/plain"));
        }
    }
}
