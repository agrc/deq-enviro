using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Extensions;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Models;
using Deq.Search.Soe.Models.Search;
using ESRI.ArcGIS.Carto;
using ESRI.ArcGIS.Geodatabase;
using EsriJson.Net.Graphic;
using ESRI.ArcGIS.Geometry;

namespace Deq.Search.Soe.Commands.Searches {
    public class QueryCommand : Command<Dictionary<int, LayerSearchResult>> {
        private readonly IEnumerable<SearchLayerProperties> _layerProperties;
        private readonly EdgeCaseInformation _edgeCase;
        private readonly ISpatialFilter _queryFilter;

        public QueryCommand(ISpatialFilter queryFilter, IEnumerable<SearchLayerProperties> layerProperties, EdgeCaseInformation edgeCase) {
            _queryFilter = queryFilter;
            _layerProperties = layerProperties;
            _edgeCase = edgeCase;
        }

        protected override void Execute() {
            var results = _layerProperties
                .Select(x => new {
                    map = ApplicationCache.FeatureClassIndexMap.Single(y => y.Index == x.Index),
                    definitionExpression = x.DefQuery
                })
                .ToDictionary(result => result.map.Index,
                              result => Query(result.map, result.definitionExpression));
            Result = results;
        }

        private LayerSearchResult Query(FeatureClassIndexMap map,
                                           string definitionExpression) {
            var searchResult = new LayerSearchResult();
            var geometryCollection = new GeometryBag() as IGeometryCollection;

           
            var featureLayer = new FeatureLayer {
                FeatureClass = map.FeatureClass
            };

            if (map.LayerName == ApplicationCache.Settings.FacilityUst && _edgeCase != null && _edgeCase.IsProgramSearch)
            {
                _queryFilter.WhereClause = string.Format("{0}{1}", _queryFilter.WhereClause,
                                           string.Format(" OR FACILITYID IN (SELECT FACILITYID FROM DEQMAP_LUST WHERE upper(DERRID) = upper('{0}'))", _edgeCase.ProgramId));
            }

            if (!string.IsNullOrEmpty(definitionExpression)) {
                var featureDefinition = featureLayer as IFeatureLayerDefinition2;
                if (featureDefinition != null) {
                    featureDefinition.DefinitionExpression = definitionExpression;
                }
            }

            if (_queryFilter.Geometry != null && map.FeatureClass.ShapeType == esriGeometryType.esriGeometryPolygon)
            {
                var topoOp = _queryFilter.Geometry as ITopologicalOperator2;
                _queryFilter.Geometry = (topoOp).Buffer(-250) as IPolygon;
            }

            var cursor = featureLayer.Search(_queryFilter, true);

            var count = 0;

            IFeature feature;
            while ((feature = cursor.NextFeature()) != null)
            {
                count++;
                if (count >= ApplicationCache.Settings.MaxRecords)
                {
                    throw new InvalidDataException("Max records exceeded on {0}. ({1})".With(map.LayerName, map.Index));
                }

                var indexes = map.FieldMap.Values.ToList();

                var attributes = CommandExecutor.ExecuteCommand(new GetValueAtIndexCommand(indexes, feature))
                                                .ToDictionary(k => k.Key, v => v.Value);

                searchResult.Features.Add(attributes);

                if (geometryCollection != null)
                {
                    geometryCollection.AddGeometry(feature.ShapeCopy);
                }
            }

            if (count > 0)
            {
                var bag = geometryCollection as IGeometryBag;
                if (bag != null)
                {
                    var envelope = bag.Envelope;
                    var extent = new EsriJson.Net.Geometry.Extent(envelope.XMin, envelope.YMin, envelope.XMax,
                                                                  envelope.YMax);
                    searchResult.Extent = extent;
                }
            }

            Marshal.ReleaseComObject(cursor);

            return searchResult;
        }

        public override string ToString() {
            return string.Format("{0}, Query: {1}", "QueryCommand", _queryFilter);
        }
    }
}
