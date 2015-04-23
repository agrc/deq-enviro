using System.Collections.Generic;
using EsriJson.Net.Geometry;
using Newtonsoft.Json;

namespace Deq.Search.Soe.Models.Search {
    /// <summary>
    ///     The format of the individual layer search results
    /// </summary>
    public class LayerSearchResult {
        /// <summary>
        ///     Gets or sets the geometry.
        /// </summary>
        /// <value>
        ///     The geometry represented as json.
        /// </value>
        [JsonProperty(PropertyName = "extent")]
        public Extent Extent { get; set; }

        /// <summary>
        ///     Gets or sets the attributes.
        /// </summary>
        /// <value>
        ///     The attributes as a key value pair.
        /// </value>
        [JsonProperty(PropertyName = "features")]
        public List<Dictionary<string, object>> Features { get; set; }

        public LayerSearchResult()
        {
            Features = new List<Dictionary<string, object>>();
        }
    }
}
