using System.Collections.Generic;
using AutoMapper;
using Containers;
using Nancy;
using Nancy.ModelBinding;
using Newtonsoft.Json.Linq;
using Search.Api.Models.Request;
using Search.Api.Models.Soe;
using Search.Api.Serializers;
using Search.Api.Services;

namespace Search.Api {
    public class SearchModule : NancyModule {
        /// <summary>
        ///     Initializes a new instance of the <see cref="SearchModule" /> class.
        ///     Handles all http requests going to /search
        /// </summary>
        public SearchModule(IQuerySoeService queryService) : base("/search") {
            Post["/", true] = async (_, ctx) => {
                var model = this.Bind<SearchRequestModel>();

                //check for time restrictions

                //get username and query permission proxy for restrictions

                //make request to soe
                var soeSearchRequestModel = Mapper.Map<SearchRequestModel, SoeSearchRequestModel>(model);
                var keyValuePairs = FormUrl.CreateObjects(soeSearchRequestModel);

                var resultContent = await queryService.Query(keyValuePairs);

                return new ResponseContainer<Dictionary<int, IEnumerable<JObject>>>(resultContent);
            };
        }
    }
}
