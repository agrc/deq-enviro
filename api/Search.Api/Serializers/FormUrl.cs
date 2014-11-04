using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Humanizer;

namespace Search.Api.Serializers {
    public static class FormUrl {
        /// <summary>
        ///     Calls AddParameter() for all public, readable properties specified in the white list
        /// </summary>
        /// <example>
        ///     request.AddObject(product, "ProductId", "Price", ...);
        /// </example>
        /// <param name="obj">The object with properties to add as parameters</param>
        /// <param name="whitelist">The names of the properties to include</param>
        /// <returns>This request</returns>
        public static List<KeyValuePair<string, string>> CreateObjects(object obj, params string[] whitelist)
        {
            // automatically create parameters from object props
            var pairs = new List<KeyValuePair<string, string>>();
            var type = obj.GetType();
            var props = type.GetProperties();

            foreach (var prop in props)
            {
                var isAllowed = whitelist.Length == 0 || (whitelist.Length > 0 && whitelist.Contains(prop.Name));

                if (!isAllowed)
                {
                    continue;
                }

                var propType = prop.PropertyType;
                var val = prop.GetValue(obj, null);

                if (val == null)
                {
                    continue;
                }

                if (propType.IsArray)
                {
                    var elementType = propType.GetElementType();

                    if (((Array) val).Length >= 0
                        && (elementType.IsPrimitive || elementType.IsValueType || elementType == typeof (string)))
                    {
                        // convert the array to an array of strings

                        var valueArry = val as IList;
                        var values = new Collection<string>();
                        foreach (var t in valueArry)
                        {
                                if (t == null)
                                {
                                    values.Add("\"\"");
                                    continue;
                                }

                                var format = "\"{0}\"";

                                if (typeof(int).IsAssignableFrom(elementType))
                                {
                                    format = "{0}";
                                }

                            values.Add(string.Format(format, t));

                        }

                        val = string.Format("[{0}]", string.Join(",", values));
                    }
                    else
                    {
                        // try to cast it
                        val = string.Format("[{0}]", string.Join(",", (string[]) val));
                    }
                }

                pairs.Add(new KeyValuePair<string, string>(prop.Name.Camelize(), val.ToString()));
            }

            return pairs;
        }
    }
}