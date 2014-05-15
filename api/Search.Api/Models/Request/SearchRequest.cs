using System.Collections.Generic;

namespace Search.Api.Models.Request {
    /// <summary>
    ///     A model for the incoming json from the web app.
    ///     Determines how to search the data
    /// </summary>
    public class SearchRequest {
        /// <summary>
        ///     Gets or sets the query layers.
        /// </summary>
        /// <value>
        ///     The query layers involved in the search.
        /// </value>
        public List<QueryLayer> QueryLayers { get; set; }

        /// <summary>
        ///     Gets or sets the geometry.
        /// </summary>
        /// <value>
        ///     The geometry used to search in the query.
        /// </value>
        public Geometry Geometry { get; set; }

        /// <summary>
        ///     Gets or sets the name of the site.
        /// </summary>
        /// <value>
        ///     The sitename model used to search the sitename field.
        /// </value>
        public SiteName SiteName { get; set; }

        /// <summary>
        ///     Gets or sets the program identifier.
        /// </summary>
        /// <value>
        ///     The program identifier.
        /// </value>
        public string ProgramId { get; set; }
    }
}
