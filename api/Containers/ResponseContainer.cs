using System.Net;

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

        public T Result { get; set; }
    }

    /// <summary>
    ///     A container class for returning api call results with status messages.
    /// </summary>
    public class ResponseContainer {
        public ResponseContainer(HttpStatusCode status, string message) {
            Status = (int)status;
            Message = message;
        }

        public int Status { get; set; }

        public string Message { get; set; }

        public bool ShouldSerializeMessage() {
            return !string.IsNullOrEmpty(Message);
        }
    }
}
