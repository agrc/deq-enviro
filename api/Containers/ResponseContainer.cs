using System.Net;
using Newtonsoft.Json;

namespace Containers {
    /// <summary>
    ///     Generic ResultContainer for passing result data
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class ResponseContainer<T> : ResponseContainer where T : class {
        public ResponseContainer(T result, HttpStatusCode status = HttpStatusCode.OK, string message = null)
            : base(status, message) {
            Result = result;
        }

        [JsonProperty("result")]
        public T Result { get; set; }
    }

    /// <summary>
    ///     A container class for returning api call results with status messages.
    /// </summary>
    public class ResponseContainer : SoeErrorable {
        private string _message;

        private int _status;

        public ResponseContainer(HttpStatusCode status, string message) {
            Status = (int)status;
            Message = message;
        }

        [JsonProperty("status")]
        public int Status {
            get {
                if (Error != null && Error.Code > 0) {
                    return Error.Code;
                }

                return _status;
            }
            set { _status = value; }
        }

        /// <summary>
        ///     Gets or sets the message.
        /// </summary>
        /// <value> The error message to display to the user. </value>
        [JsonProperty("message")]
        public string Message {
            get {
                if (Error != null && Error.Code > 0) {
                    return Error.Message;
                }

                return _message;
            }
            set { _message = value; }
        }

        /// <summary>
        ///     Gets a value indicating whether this instance has errors.
        /// </summary>
        /// <value>
        ///     <c>true</c> if this instance has errors; otherwise, <c>false</c> .
        /// </value>
        [JsonIgnore]
        public bool HasErrors {
            get { return !string.IsNullOrEmpty(Message); }
        }

        public bool ShouldSerializeMessage() {
            return !string.IsNullOrEmpty(Message);
        }
    }
}
