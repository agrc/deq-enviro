using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Net;
using System.Runtime.InteropServices;
using Containers;
using Deq.Search.Soe.Attributes;
using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Commands.Searches;
using Deq.Search.Soe.Extensions;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Infastructure.Endpoints;
using Deq.Search.Soe.Models.Search;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geometry;
using ESRI.ArcGIS.SOESupport;
using EsriJson.Net.Graphic;

namespace Deq.Search.Soe.Endpoints {
    /// <summary>
    ///     A rest endpoint. All endpoints are marked with the [Endpoint] attribute and dynamically added to the implmentation
    ///     at registration time
    /// </summary>
    [Endpoint]
    public class DeqSearchRestEndpoint : JsonEndpoint, IRestEndpoint {
        /// <summary>
        ///     The resource name that displays for Supported Operations
        /// </summary>
        private const string ResourceName = "Search";

        #region IRestEndpoint Members

        /// <summary>
        ///     A method that the dynamic endpoint setup uses for registering the rest endpoing operation details.
        /// </summary>
        /// <returns> </returns>
        public RestOperation RestOperation()
        {
            return new RestOperation(ResourceName,
                                     new[]
                                         {
                                             "layerIds", "definitionQueries", "searchMethod", "geometry", "siteName",
                                             "programId", "defQuery", "includeAll", "accessRules"
                                         },
                                     new[]
                                         {
                                             "json"
                                         },
                                     Handler);
        }

        #endregion

        /// <summary>
        ///     Handles the incoming rest requests
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
                                     out string responseProperties)
        {
            responseProperties = null;
            var errors = new ResponseContainer(HttpStatusCode.BadRequest, "");

            string searchMethod;
            try
            {
                searchMethod = operationInput.GetStringValue("searchMethod");
            }
            catch (ArgumentException)
            {
                errors.Message = "Search Method must contain 'geometry', 'siteName', 'programId', or 'defQuery' to limit search";

                return Json(errors);
            }

            object[] layerIds;
            var found = operationInput.TryGetArray("layerIds", out layerIds);
            if (!found || layerIds.Length < 1)
            {
                errors.Message += "Value cannot be null: {0}. ".With("layerids");
            }

            object[] definitionQueries;
            found = operationInput.TryGetArray("definitionQueries", out definitionQueries);
            if (!found || definitionQueries.Length < 1)
            {
                errors.Message += "Value cannot be null: {0}. ".With("definitionQueries");
            }

            if (errors.HasErrors)
            {
                return Json(errors);
            }

            var layerProperties =
                CommandExecutor.ExecuteCommand(new BuildLayerPropertiesCommand(layerIds, definitionQueries));
            SpatialFilter queryFilter = null;

            var searchType = SearchType.None;
            EdgeCaseInformation edge = null;

            switch (searchMethod)
            {
                case "geometry":
                    {
                        JsonObject geometryObject;
                        found = operationInput.TryGetJsonObject("geometry", out geometryObject);
                        if (!found)
                        {
                            errors.Message += "Value cannot be null: {0}. ".With("geometry");

                            return Json(errors);
                        }

                        var geometry = Conversion.ToGeometry(geometryObject, esriGeometryType.esriGeometryPolygon);

                        queryFilter = new SpatialFilter
                            {
                                Geometry = geometry,
                                SpatialRel = esriSpatialRelEnum.esriSpatialRelIntersects
                            };

                        searchType = SearchType.Geometry;

                        break;
                    }
                case "site":
                    {
                        bool? includeAll;
                        var siteName = operationInput.GetStringOrNumberValueAsString("siteName", true);
                        if (string.IsNullOrEmpty(siteName))
                        {
                            errors.Message += "Value cannot be null: {0}. ".With("siteName");

                            return Json(errors);
                        }

                        found = operationInput.TryGetAsBoolean("includeAll", out includeAll);
                        if (!found || !includeAll.HasValue)
                        {
                            includeAll = false;
                        }

                        var query =
                            CommandExecutor.ExecuteCommand(
                                new ComposeMultiConditionQueryCommand(ApplicationCache.Settings.SiteName,
                                                                      siteName,
                                                                      includeAll.Value));

                        queryFilter = new SpatialFilter
                            {
                                WhereClause = query
                            };

                        searchType = SearchType.Site;

                        break;
                    }
                case "program":
                    {
                        var program = operationInput.GetStringOrNumberValueAsString("programId", true);
                        if (string.IsNullOrEmpty(program))
                        {
                            errors.Message += "Value cannot be null: {0}. ".With("program");

                            return Json(errors);
                        }

                        var query = string.Format("upper({0}) = upper('{1}')", ApplicationCache.Settings.ProgramId,
                                                  program);

                        queryFilter = new SpatialFilter
                            {
                                WhereClause = query
                            };

                        searchType = SearchType.Program;
                        edge = new EdgeCaseInformation
                            {
                                ProgramId = program,
                                SearchType = searchType
                            };

                        break;
                    }

                case "defQuery":
                    {
                        var defQuery = operationInput.GetStringOrNumberValueAsString("defQuery", true);
                        if (string.IsNullOrEmpty(defQuery))
                        {
                            errors.Message += "Value cannot be null: {0}. ".With("defQuery");

                            return Json(errors);
                        }

                        queryFilter = new SpatialFilter
                            {
                                WhereClause = defQuery
                            };
                        break;
                    }
            }

            var accessRules = operationInput.GetStringValue("accessRules", true);
            if (!string.IsNullOrEmpty(accessRules) && accessRules.ToUpper() != "STATEWIDE")
            {
                var countyFilter = new QueryFilter
                    {
                        WhereClause =
                            CommandExecutor.ExecuteCommand(new ComposeMultiConditionQueryCommand("Name", accessRules,
                                                                                                 false))
                    };

                var cursor = ApplicationCache.County.Search(countyFilter, true);

                IFeature feature;
                IGeometry geom = null;
                while ((feature = cursor.NextFeature()) != null)
                {
                    if (geom == null)
                    {
                        //initialze topo op to the first geometry
                        geom = feature.ShapeCopy;
                        continue;
                    }

                    var topo = (ITopologicalOperator2) geom;

                    geom = topo.Union(feature.ShapeCopy);
                }

                Marshal.ReleaseComObject(cursor);

                if (queryFilter.Geometry != null)
                {
                    var topo = (ITopologicalOperator2) geom;

                    queryFilter.Geometry = topo.Intersect(queryFilter.Geometry,
                                                          esriGeometryDimension.esriGeometry2Dimension);
                }
                else
                {
                    queryFilter.Geometry = geom;
                    queryFilter.SpatialRel = esriSpatialRelEnum.esriSpatialRelIntersects;
                }

            }

            Dictionary<int, IEnumerable<Graphic>> result;
            var queryCommand = new QueryCommand(queryFilter, layerProperties, edge);

            try
            {
                result = CommandExecutor.ExecuteCommand(queryCommand);
            }
            catch (Exception ex)
            {
                return Json(new ResponseContainer(HttpStatusCode.InternalServerError, ex.Message));
            }

            return Json(new ResponseContainer<Dictionary<int, IEnumerable<Graphic>>>(result));
        }
    }
}