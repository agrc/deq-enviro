using System.Collections.Generic;
using System.Threading.Tasks;
using Containers;
using Newtonsoft.Json.Linq;

namespace Search.Api.Services {
    /// <summary>
    ///     The interface to query the soe
    /// </summary>
    public interface IQuerySoeService {
        /// <summary>
        ///     Queries the soe with specified values form value encoded.
        /// </summary>
        /// <param name="formValues">The form values.</param>
        /// <returns></returns>
        Task<ResponseContainer<Dictionary<int, IEnumerable<JObject>>>> Query(IEnumerable<KeyValuePair<string, string>> formValues);
    }
}
