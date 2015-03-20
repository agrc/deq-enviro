using System.Collections.Generic;

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
        public Dictionary<string, double> Extent { get; set; }

        /// <summary>
        ///     Gets or sets the attributes.
        /// </summary>
        /// <value>
        ///     The attributes as a key value pair.
        /// </value>
        public List<Dictionary<string, object>> Features { get; set; }

        public LayerSearchResult()
        {
            Features = new List<Dictionary<string, object>>();
            Extent = new Dictionary<string, double>();
        }
    }
}
