using AutoMapper;
using Nancy;
using Nancy.ModelBinding;
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
                var model = this.Bind<SearchRequest>();

                //check for time restrictions

                //get username and query permission proxy for restrictions

                //make request to soe
                var soeSearchRequestModel = Mapper.Map<SearchRequest, SoeSearchRequest>(model);
                var keyValuePairs = FormUrl.CreateObjects(soeSearchRequestModel);

                var resultContent = await queryService.Query(keyValuePairs);

                return resultContent;
            };
        }
    }
}
