using System.Collections.Generic;
using System.Collections.ObjectModel;
using Deq.Search.Soe.Models;
using Deq.Search.Soe.Models.Configuration;
using ESRI.ArcGIS.Geodatabase;

namespace Deq.Search.Soe.Cache {
    /// <summary>
    ///     The global cache for the application
    /// </summary>
    public static class ApplicationCache {
        /// <summary>
        ///     The property value index map
        /// </summary>
        public static Dictionary<IFeatureClass, IndexFieldMap> PropertyValueIndexMap;

        /// <summary>
        ///     Gets or sets the feature class index map.
        /// </summary>
        /// <value>
        ///     The feature class index map.
        /// </value>
        public static Collection<FeatureClassIndexMap> FeatureClassIndexMap { get; set; }

        /// <summary>
        ///     Gets or sets the fields used in the application.
        /// </summary>
        /// <value>
        ///     The fields.
        /// </value>
        public static ApplicationSettings Settings { get; set; }

        /// <summary>
        /// Gets or sets the index of the county in the mxd.
        /// </summary>
        /// <value>
        /// The index of the county.
        /// </value>
        public static IFeatureClass County { get; set; }
    }
}
