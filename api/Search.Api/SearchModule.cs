#region license
// The MIT License
// 
// Copyright (c) 2014 AGRC
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons 
// to whom the Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or 
// substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#endregion

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading;
using AutoMapper;
using Containers;
using EsriJson.Net.Graphic;
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
    ///   Initializes a new instance of the <see cref="SearchModule" /> class.
    ///   Handles all http requests going to /search
    /// </summary>
    public SearchModule() : base("/search") {
      Post["/"] = _ => {
        var model = this.Bind<SearchRequestModel>();

        //check for time restrictions

        //get username and query permission proxy for restrictions

        //make request to soe
        var soeSearchRequestModel = Mapper.Map<SearchRequestModel, SoeSearchRequestModel>(model);
        var keyValuePairs = FormUrl.CreateObjects(soeSearchRequestModel);

        using (var client = new HttpClient())
        {
          client.BaseAddress = new Uri("http://localhost");
          var content = new FormUrlEncodedContent(keyValuePairs);

          var response = client.PostAsync("/arcgis/rest/services/Deq/SoeTest/MapServer/exts/DeqSearchSoe/Search", content).Result;
          var x = response.Content.ReadAsStringAsync().Result;
          var resultContent = response.Content.ReadAsAsync<Dictionary<int, IEnumerable<JObject>>>(
            new [] {
              new TextPlainResponseFormatter()
            }).Result;

          return new ResponseContainer<Dictionary<int, IEnumerable<JObject>>>(resultContent);
        }
      };
    }
  }
}
