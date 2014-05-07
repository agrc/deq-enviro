using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Models;
using Deq.Search.Soe.Models.Search;
using ESRI.ArcGIS.Geodatabase;
using EsriJson.Net.Graphic;

namespace Deq.Search.Soe.Commands.Searches {
    /// <summary>
    ///     Performs the deq site search
    /// </summary>
    public class SiteSearchQueryCommand : Command<Dictionary<int, IEnumerable<Graphic>>> {
        private readonly IEnumerable<SearchLayerProperties> _layerProperties;

        private readonly string _query;

        public SiteSearchQueryCommand(string query, IEnumerable<SearchLayerProperties> layerProperties) {
            _query = query;
            _layerProperties = layerProperties;
        }

        protected override void Execute() {
            var results = _layerProperties.Select(
                x => ApplicationCache.FeatureClassIndexMap.Single(y => y.Index == x.Index))
                                          .ToDictionary(map => map.Index, map => Query(map.FeatureClass, map));

            Result = results;
        }

        private IEnumerable<Graphic> Query(IFeatureClass featureClass, FeatureClassIndexMap map) {
            //there might be spatial restrictions 
            //this queryfilter might need to be a spatial filter
            var queryFilter = new QueryFilter {
                WhereClause = _query
            };

            var cursor = featureClass.Search(queryFilter, true);

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
            return string.Format("{0}, Query: {1}", "SiteSearchQueryCommand", _query);
        }
    }
}
