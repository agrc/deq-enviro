using Deq.Search.Soe.Models.Configuration;
using ESRI.ArcGIS.esriSystem;

namespace Deq.Search.Soe.Infastructure {
    /// <summary>
    ///     Interface for getting field names and other configurable stuff
    /// </summary>
    public interface IConfigurable {
        /// <summary>
        ///     Gets the name of the fields.
        /// </summary>
        /// <param name="props"> The fields to search. </param>
        /// <returns> </returns>
        ApplicationFieldSettings GetFields(IPropertySet props);
    }
}
