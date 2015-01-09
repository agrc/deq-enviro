﻿using System;
using ESRI.ArcGIS.SOESupport;
using ESRI.ArcGIS.esriSystem;

namespace Deq.Search.Soe.Extensions {
    /// <summary>
    ///     Extensions on property sets
    /// </summary>
    public static class PropertySetExensions {
        /// <summary>
        ///     Gets the value as string.
        /// </summary>
        /// <param name="property"> The property. </param>
        /// <param name="key"> The key. </param>
        /// <param name="errorOnNull">
        ///     if set to <c>true</c> [error on null].
        /// </param>
        /// <returns> </returns>
        /// <exception cref="System.NullReferenceException"></exception>
        public static string GetValueAsString(this IPropertySet property, string key, bool errorOnNull = false) {
            var value = property.GetProperty(key) as string;

            if (string.IsNullOrEmpty(value)) {
                var msg = "{0} is null or empty. Please add this value to the properties " +
                          "in the SOE capabilies section of the server manager application.".With(key);

                var logger = new ServerLogger();
                logger.LogMessage(ServerLogger.msgType.warning, "GetPropertyValue", 2472,
                                  msg);
                logger = null;

                if (errorOnNull) {
                    throw new NullReferenceException(msg);
                }
            }

            return value ?? "";
        }

        public static int GetValueAsInt(this IPropertySet property, string key, bool errorOnNull = false)
        {
            var value = property.GetProperty(key) as string;
            var maxRecords = 50000;

            try
            {
                int.TryParse(value, out maxRecords);
            }
            catch (Exception)
            {
                maxRecords = -1;
            }

            if (maxRecords < 1)
            {
                var msg = "{0} is null or empty. Please add this value to the properties " +
                          "in the SOE capabilies section of the server manager application.".With(key);

                var logger = new ServerLogger();
                logger.LogMessage(ServerLogger.msgType.warning, "GetPropertyValue", 2472,
                                  msg);
                logger = null;

                if (errorOnNull)
                {
                    throw new NullReferenceException(msg);
                }
            }

            return maxRecords;
        }
    }
}
