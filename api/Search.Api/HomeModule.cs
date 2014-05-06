using Nancy;

namespace Search.Api {
    /// <summary>
    ///     Just a controller to handle browsing to the api
    /// </summary>
    public class HomeModule : NancyModule {
        /// <summary>
        ///     Initializes a new instance of the <see cref="HomeModule" /> class.
        /// </summary>
        public HomeModule() {
            Get["/"] = _ => View["Home"];
        }
    }
}
