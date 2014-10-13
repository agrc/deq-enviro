using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Containers;
using Nancy;
using Nancy.ModelBinding;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Raven.Client;
using Search.Api.Index;
using Search.Api.Models.Database;
using Search.Api.Models.Request;
using Search.Api.Models.Response;
using Search.Api.Models.Soe;
using Search.Api.Serializers;
using Search.Api.Services;
using HttpStatusCode = System.Net.HttpStatusCode;

namespace Search.Api {
    public class SearchModule : NancyModule {
        /// <summary>
        ///     Initializes a new instance of the <see cref="SearchModule" /> class.
        ///     Handles all http requests going to /search
        /// </summary>
        public SearchModule(IQuerySoeService queryService, IDocumentSession session) : base("/search")
        {
            Post["/", true] = async (_, ctx) =>
                {
                    var model = this.Bind<SearchRequest>();
                    var result = new QueryLayerResponse
                        {
                            Status = 200
                        };

                    //make request to soe
                    var soeSearchRequestModel = Mapper.Map<SearchRequest, SoeSearchRequest>(model);
                    var keyValuePairs = FormUrl.CreateObjects(soeSearchRequestModel);

                    var resultContent = await queryService.Query(keyValuePairs, false);
                    result.QueryLayers = resultContent;

                    if (model.SecureQueryLayers == null || !model.SecureSearch ||
                        model.UserId == Guid.Empty)
                    {
                        result.Status = result.QueryLayers.Status;

                        return result;
                    }

                    //get username and query permission proxy for restrictions
                    using (session)
                    {
                        User user;

                        try
                        {
                            user = session.Query<User, UserByIdIndex>()
                                          .Single(x => x.UserId == model.UserId);
                        }
                        catch (InvalidOperationException)
                        {
                            result.SecureQueryLayers = new ResponseContainer<Dictionary<int, IEnumerable<JObject>>>(
                                null, HttpStatusCode.OK, "User not found")
                                {
                                    Status = 422
                                };

                            result.Status = (int) HttpStatusCode.PartialContent;

                            return result;
                        }
                        catch (ArgumentNullException)
                        {
                            result.SecureQueryLayers = new ResponseContainer<Dictionary<int, IEnumerable<JObject>>>(
                                null, HttpStatusCode.OK, "User not found")
                                {
                                    Status = 422
                                };

                            result.Status = (int) HttpStatusCode.PartialContent;

                            return result;
                        }

                        if (!string.IsNullOrEmpty(user.AccessRules.OptionsSerialized))
                        {
                            var counties =
                                JsonConvert.DeserializeObject<AccessRules>(user.AccessRules.OptionsSerialized).Counties;
                            if (counties.Any())
                            {
                                soeSearchRequestModel.AccessRules = string.Join(",", counties);
                            }
                        }
                    }

                    // update to secured values
                    soeSearchRequestModel.LayerIds =
                        model.SecureQueryLayers.Select(x => x.Id).ToArray();
                    soeSearchRequestModel.DefinitionQueries =
                        model.SecureQueryLayers.Select(x => x.DefQuery).ToArray();
                    soeSearchRequestModel.Token = model.Token;

                    var secureKeyValueParis = FormUrl.CreateObjects(soeSearchRequestModel);
                    var secureResultContent = await queryService.Query(secureKeyValueParis, true);

                    result.SecureQueryLayers = secureResultContent;

                    if (result.SecureQueryLayers.HasErrors || result.QueryLayers.HasErrors)
                    {
                        result.Status = 206;
                    }

                    if (result.SecureQueryLayers.HasErrors && result.QueryLayers.HasErrors)
                    {
                        result.Status = new[] {result.QueryLayers.Status, result.SecureQueryLayers.Status}.Max();
                    }

                    return result;
                };
        }
    }
}