﻿#region license
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
using System.Collections.Specialized;
using Deq.Search.Soe.Attributes;
using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Commands.Searches;
using Deq.Search.Soe.Extensions;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Infastructure.Endpoints;
using Deq.Search.Soe.Models.Esri;
using ESRI.ArcGIS.SOESupport;

namespace Deq.Search.Soe.Endpoints {
  /// <summary>
  ///   A rest endpoint. All endpoints are marked with the [Endpoint] attribute and dynamically added to the implmentation
  ///   at registration time
  /// </summary>
  [Endpoint]
  public class DeqSearchRestEndpoint : JsonEndpoint, IRestEndpoint {
    /// <summary>
    ///   The resource name that displays for Supported Operations
    /// </summary>
    private const string ResourceName = "Search";

    #region IRestEndpoint Members
    /// <summary>
    ///   A method that the dynamic endpoint setup uses for registering the rest endpoing operation details.
    /// </summary>
    /// <returns> </returns>
    public RestOperation RestOperation() {
      return new RestOperation(ResourceName,
                               new[] {
                                 "layerIds", "definitionQueries", "searchMethod", "geometryJson", "siteName"
                                 ,
                                 "programId", "includeAll"
                               },
                               new[] {
                                 "json"
                               },
                               Handler);
    }
    #endregion

    /// <summary>
    ///   Handles the incoming rest requests
    /// </summary>
    /// <param name="boundVariables"> The bound variables. </param>
    /// <param name="operationInput"> The operation input. </param>
    /// <param name="outputFormat"> The output format. </param>
    /// <param name="requestProperties"> The request properties. </param>
    /// <param name="responseProperties"> The response properties. </param>
    /// <returns> </returns>
    /// <exception cref="System.ArgumentNullException"></exception>
    public static byte[] Handler(NameValueCollection boundVariables, JsonObject operationInput,
                                 string outputFormat, string requestProperties,
                                 out string responseProperties) {
      responseProperties = null;
      var errors = new ErrorModel(400);

      string searchMethod;
      try {
        searchMethod = operationInput.GetStringValue("searchMethod");
      } catch (ArgumentException) {
        errors.Message = "Search Method must contain 'geometry', 'site' or 'program' to limit search";

        return Json(new ErrorContainer(errors));
      }

      object[] layerIds;
      var found = operationInput.TryGetArray("layerIds", out layerIds);
      if (!found || layerIds.Length < 1) {
        errors.Message += "Value cannot be null: {0}. ".With("layerids");
      }

      object[] definitionQueries;
      found = operationInput.TryGetArray("definitionQueries", out definitionQueries);
      if (!found || definitionQueries.Length < 1) {
        errors.Message += "Value cannot be null: {0}. ".With("definitionQueries");
      }

      switch (searchMethod) {
        case "geometry": {
          object[] geometryJson;
          found = operationInput.TryGetArray("geometryJson", out geometryJson);
          if (!found || geometryJson.Length < 1) {
            errors.Message += "Value cannot be null: {0}. ".With("geometry");
          }

          break;
        }
        case "site": {
          bool? includeAll = false;
          var siteName = operationInput.GetStringValue("siteName", true);
          found = operationInput.TryGetString("siteName", out siteName);
          if (!found || string.IsNullOrEmpty(siteName)) {
            errors.Message += "Value cannot be null: {0}. ".With("siteName");
          } else {
            found = operationInput.TryGetAsBoolean("includeAll", out includeAll);
            if (!found || !includeAll.HasValue) {
              includeAll = false;
            }
          }

          var query =
            CommandExecutor.ExecuteCommand(new BuildSiteSearchQueryCommand(siteName, includeAll.Value));
          var layerProperties =
            CommandExecutor.ExecuteCommand(new BuildLayerPropertiesCommand(layerIds, definitionQueries));

          var result = CommandExecutor.ExecuteCommand(new SiteSearchQueryCommand(query, layerProperties));

          return Json(result);
        }
        case "program": {
          string program;
          found = operationInput.TryGetString("program", out program);
          if (!found || string.IsNullOrEmpty(program)) {
            errors.Message += "Value cannot be null: {0}. ".With("program");
          }

          break;
        }
      }

      if (errors.HasErrors) {
        return Json(new ErrorContainer(errors));
      }

      return Json(ApplicationCache.Fields);
    }
  }
}
