using System.Collections.Generic;

namespace Search.Api.Models.Request {
    public class SiteName {
        /// <summary>
        ///     Gets or sets the terms.
        /// </summary>
        /// <value>
        ///     The terms to search for.
        /// </value>
        public List<string> Terms { get; set; }

        /// <summary>
        ///     Gets or sets a value indicating whether [include all].
        ///     If true do full text search using and otherwise or.
        /// </summary>
        /// <value>
        ///     <c>true</c> if [include all]; otherwise, <c>false</c>.
        /// </value>
        public bool IncludeAll { get; set; }
    }
}
