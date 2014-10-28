using Deq.Search.Soe.Models.Configuration;
using ESRI.ArcGIS.esriSystem;

namespace Deq.Search.Soe.Infastructure {
    /// <summary>
    ///     Interface for getting field names and other configurable stuff
    /// </summary>
    public interface IConfigurable {
        /// <summary>
        ///     Gets the name of the settings.
        /// </summary>
        /// <param name="props"> The settings to search. </param>
        /// <returns> </returns>
        ApplicationSettings GetSettings(IPropertySet props);
    }
}
