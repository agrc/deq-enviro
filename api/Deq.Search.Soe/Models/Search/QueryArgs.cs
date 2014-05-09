using System.Collections.Generic;
using ESRI.ArcGIS.Geodatabase;

namespace Deq.Search.Soe.Models.Search {
    public class QueryArgs {
        /// <summary>
        /// Gets or sets the spatial filter.
        /// </summary>
        /// <value>
        /// The spatial filter used to query the layers in SearchLayerProperties.
        /// </value>
        public ISpatialFilter SpatialFilter { get; set; }

        /// <summary>
        /// Gets or sets the search layer properties.
        /// </summary>
        /// <value>
        /// The information about the layer to be searched.
        /// </value>
        public IEnumerable<SearchLayerProperties> SearchLayerProperties { get; set; }
    }
}