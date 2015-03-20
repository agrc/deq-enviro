using System.Collections.Generic;
using Containers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Search.Api.Models.Response {
    public class QueryLayerResponse {
        /// <summary>
        /// Gets or sets the query layers.
        /// </summary>
        /// <value>
        /// The query layers.
        /// </value>
        [JsonProperty(PropertyName = "queryLayers")]
        public ResponseContainer<Dictionary<int, JObject>> QueryLayers { get; set; }

        /// <summary>
        /// Gets or sets the secure query layers.
        /// </summary>
        /// <value>
        /// The secure query layers.
        /// </value>
        [JsonProperty(PropertyName = "secureQueryLayers")]        
        public ResponseContainer<Dictionary<int, JObject>> SecureQueryLayers { get; set; }

        /// <summary>
        /// Gets or sets the status.
        /// </summary>
        /// <value>
        /// The status.
        /// </value>
        [JsonProperty(PropertyName="status")]
        public int Status { get; set; }
    }
}