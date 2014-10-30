using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Models;
using Deq.Search.Soe.Models.Search;
using ESRI.ArcGIS.Carto;
using ESRI.ArcGIS.Geodatabase;
using EsriJson.Net.Graphic;

namespace Deq.Search.Soe.Commands.Searches {
    public class QueryCommand : Command<Dictionary<int, IEnumerable<Graphic>>> {
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

        private IEnumerable<Graphic> Query(FeatureClassIndexMap map,
                                           string definitionExpression) {
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

            var cursor = featureLayer.Search(_queryFilter, true);

            var results = new List<Graphic>();

            IFeature feature;
            while ((feature = cursor.NextFeature()) != null) {
                var indexes = map.FieldMap.Values.ToList();

                var attributes = CommandExecutor.ExecuteCommand(new GetValueAtIndexCommand(indexes, feature))
                                                .ToDictionary(k => k.Key, v => v.Value);
                var geometry =
                    CommandExecutor.ExecuteCommand(new CreateJsFormatGeometryCommand(feature.ShapeCopy,
                                                                                     feature.ShapeCopy.SpatialReference));

                var graphic = new Graphic(geometry, attributes);

                results.Add(graphic);
            }

            Marshal.ReleaseComObject(cursor);

            return results;
        }

        public override string ToString() {
            return string.Format("{0}, Query: {1}", "QueryCommand", _queryFilter);
        }
    }
}
