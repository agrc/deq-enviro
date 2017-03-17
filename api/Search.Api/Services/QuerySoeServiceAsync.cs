using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Http;
using System.Threading.Tasks;
using Containers;
using Newtonsoft.Json.Linq;
using Search.Api.Formatters;
using Search.Api.Properties;

namespace Search.Api.Services {
    public class QuerySoeServiceAsync : IQuerySoeService {
        private string _url = "/arcgis/rest/services/DEQEnviro/MapService/MapServer/exts/DeqSearchSoe/Search";

        /// <summary>
        ///     Queries the soe with specified values form value encoded.
        /// </summary>
        /// <param name="formValues">The form values.</param>
        /// <param name="secure">
        ///     if set to <c>true</c> [secure].
        /// </param>
        /// <returns></returns>
        public async Task<ResponseContainer<Dictionary<int, JObject>>> Query(
            IEnumerable<KeyValuePair<string, string>> formValues, bool secure)
        {
            using (var client = new HttpClient())
            {
                var baseUrl = "http://test.mapserv.utah.gov:6080";
#if DEBUG
                baseUrl = "http://localhost";
#endif
#if RELEASE
                baseUrl = "http://mapserv.utah.gov";
#endif
                client.BaseAddress = new Uri(baseUrl);

                var content = new MultipartFormDataContent();
                foreach (var pair in formValues)
                {
                    content.Add(new StringContent(pair.Value), pair.Key);
                }

                if (secure)
                {
                    _url = "/arcgis/rest/services/DEQEnviro/Secure/MapServer/exts/DeqSearchSoe/Search";
                }

                var response = await client.PostAsync(_url, content);

                return await response.Content.ReadAsAsync<ResponseContainer<Dictionary<int, JObject>>>(
                    new[]
                        {
                            new TextPlainResponseFormatter()
                        });
            }
        }
    }
}