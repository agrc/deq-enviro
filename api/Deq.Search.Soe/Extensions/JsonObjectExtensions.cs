using System;
using ESRI.ArcGIS.SOESupport;

namespace Deq.Search.Soe.Extensions {
    public static class JsonObjectExtensions {
        public static string GetStringValue(this JsonObject operationInput, string name, bool nullable = false) {
            string value;

            var found = operationInput.TryGetString(name, out value);
            if (!found || string.IsNullOrEmpty(value)) {
                if (nullable) {
                    return "";
                }

                throw new ArgumentNullException(name);
            }

            return value;
        }

        public static double GetNumberValue(this JsonObject operationInput, string name, bool nullable = false) {
            double? value;

            var found = operationInput.TryGetAsDouble(name, out value);
            if (!found || !value.HasValue) {
                if (nullable) {
                    return -1;
                }

                throw new ArgumentNullException(name);
            }

            return value.Value;
        }

        public static string GetStringOrNumberValueAsString(this JsonObject operationInput, string name,
                                                            bool nullable = false) {
            var value = operationInput.GetStringValue(name, true);
            if(!string.IsNullOrEmpty(value)) {
                return value;
            }

            var number = operationInput.GetNumberValue(name, true);
            if (number > -1) {
                return number.ToString();
            }

            if (!nullable) {
                throw new ArgumentNullException(name);
            }

            return "";
        }
    }
}
