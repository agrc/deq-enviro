using System;
using System.Collections.Generic;
using System.Linq;

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
        ///     The public query layers involved in the search.
        /// </value>
        public List<QueryLayer> QueryLayers { get; set; }

         /// <summary>
        /// Gets or sets the secure query layers.
        /// </summary>
        /// <value>
        /// The secure query layers.
        /// </value>
        public List<QueryLayer> SecureQueryLayers { get; set; }

        /// <summary>
        /// Gets or sets the token.
        /// </summary>
        /// <value>
        /// The token to authenticate the request .
        /// </value>
        public string Token { get; set; }

        /// <summary>
        /// Gets or sets the user identifier.
        /// </summary>
        /// <value>
        /// The user identifier for the user in raven.
        /// </value>
        public Guid UserId { get; set; }

        /// <summary>
        /// Gets a value indicating whether this is a secure search.
        /// </summary>
        /// <value>
        ///   If there are secured query layers returnes true.
        /// </value>
        internal bool SecureSearch { get { return SecureQueryLayers.Any() && !string.IsNullOrEmpty(Token); } }

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
