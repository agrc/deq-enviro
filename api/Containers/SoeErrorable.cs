using Newtonsoft.Json;

namespace Containers {
    /// <summary>
    /// Base class to extend a model to handle soe errors
    /// </summary>
    public abstract class SoeErrorable
    {
        /// <summary>
        /// Gets or sets the error.
        /// </summary>
        /// <value>
        /// The error.
        /// </value>
        public virtual SoeError Error { get; set; }

        /// <summary>
        /// Gets a value indicating whether [is successful].
        /// </summary>
        /// <value>
        ///   <c>true</c> if [is successful]; otherwise, <c>false</c>.
        /// </value>
        [JsonIgnore]
        public virtual bool IsSuccessful
        {
            get { return Error == null; }
        }


        /// <summary>
        /// Response Container handles ETL just ignore
        /// the SOE Error
        /// </summary>
        /// <returns></returns>
        public bool ShouldSerializeError() {
            return false;
        }

        /// <summary>
        /// The format of an esri so error
        /// </summary>
        public class SoeError
        {
            /// <summary>
            /// Gets or sets the http status code.
            /// </summary>
            /// <value>
            /// The http status code.
            /// </value>
            public int Code { get; set; }

            /// <summary>
            /// Gets or sets the message.
            /// </summary>
            /// <value>
            /// The message returned from the soe.
            /// </value>
            public string Message { get; set; }
        }
    }
}