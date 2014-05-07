using System;
using System.Collections.Generic;
using System.Net.Http;
using AutoMapper;
using Containers;
using Nancy;
using Nancy.ModelBinding;
using Newtonsoft.Json.Linq;
using Search.Api.Formatters;
using Search.Api.Models.Request;
using Search.Api.Models.Soe;
using Search.Api.Serializers;

namespace Search.Api {
    public class SearchModule : NancyModule {
        /// <summary>
        ///     Initializes a new instance of the <see cref="SearchModule" /> class.
        ///     Handles all http requests going to /search
        /// </summary>
        public SearchModule() : base("/search") {
            Post["/", true] = async (_, ctx) => {
                var model = this.Bind<SearchRequestModel>();

                //check for time restrictions

                //get username and query permission proxy for restrictions

                //make request to soe
                var soeSearchRequestModel = Mapper.Map<SearchRequestModel, SoeSearchRequestModel>(model);
                var keyValuePairs = FormUrl.CreateObjects(soeSearchRequestModel);

                using (var client = new HttpClient()) {
                    client.BaseAddress = new Uri("http://localhost");
                    var content = new FormUrlEncodedContent(keyValuePairs);

                    var response = await client.PostAsync(
                        "/arcgis/rest/services/Deq/SoeTest/MapServer/exts/DeqSearchSoe/Search", content);

                    var resultContent = await response.Content.ReadAsAsync<Dictionary<int, IEnumerable<JObject>>>(
                        new[] {
                            new TextPlainResponseFormatter()
                        });

                    return new ResponseContainer<Dictionary<int, IEnumerable<JObject>>>(resultContent);
                }
            };
        }
    }
}
