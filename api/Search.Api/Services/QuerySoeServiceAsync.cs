using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Search.Api.Formatters;

namespace Search.Api.Services {
    public class QuerySoeServiceAsync : IQuerySoeService {
        /// <summary>
        ///     Queries the soe with specified values form value encoded.
        /// </summary>
        /// <param name="formValues">The form values.</param>
        /// <returns></returns>
        public async Task<Dictionary<int, IEnumerable<JObject>>> Query(
            IEnumerable<KeyValuePair<string, string>> formValues) {
            using (var client = new HttpClient()) {
                client.BaseAddress = new Uri("http://localhost");

                var content = new FormUrlEncodedContent(formValues);

                var response = await client.PostAsync(
                    "/arcgis/rest/services/Deq/SoeTest/MapServer/exts/DeqSearchSoe/Search", content);

                return await response.Content.ReadAsAsync<Dictionary<int, IEnumerable<JObject>>>(
                    new[] {
                        new TextPlainResponseFormatter()
                    });
            }
        }
    }
}