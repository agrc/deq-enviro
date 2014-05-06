namespace Deq.Search.Soe.Models.Search {
    /// <summary>
    ///     Holds information necessary to query a layer
    /// </summary>
    public class SearchLayerProperties {
        public SearchLayerProperties(int index, string defQuery = null) {
            Index = index;
            DefQuery = defQuery;
        }

        /// <summary>
        ///     Gets or sets the index of the layer in the map document.
        /// </summary>
        /// <value>
        ///     The index.
        /// </value>
        public int Index { get; set; }

        /// <summary>
        ///     Gets or sets the definition query.
        /// </summary>
        /// <value>
        ///     The definition query.
        /// </value>
        public string DefQuery { get; set; }
    }
}
