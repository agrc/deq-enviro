#region license
// The MIT License
// 
// Copyright (c) 2014 AGRC
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons 
// to whom the Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or 
// substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#endregion

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Humanizer;

namespace Search.Api.Serializers {
  public static class FormUrl {
    /// <summary>
    ///   Calls AddParameter() for all public, readable properties specified in the white list
    /// </summary>
    /// <example>
    ///   request.AddObject(product, "ProductId", "Price", ...);
    /// </example>
    /// <param name="obj">The object with properties to add as parameters</param>
    /// <param name="whitelist">The names of the properties to include</param>
    /// <returns>This request</returns>
    public static List<KeyValuePair<string, string>> CreateObjects(object obj, params string[] whitelist) {
      // automatically create parameters from object props
      var pairs = new List<KeyValuePair<string, string>>();
      var type = obj.GetType();
      var props = type.GetProperties();

      foreach (var prop in props) {
        var isAllowed = whitelist.Length == 0 || (whitelist.Length > 0 && whitelist.Contains(prop.Name));

        if (!isAllowed) {
          continue;
        }

        var propType = prop.PropertyType;
        var val = prop.GetValue(obj, null);

        if (val == null) {
          continue;
        }

        if (propType.IsArray) {
          var elementType = propType.GetElementType();

          if (((Array)val).Length > 0
              && (elementType.IsPrimitive || elementType.IsValueType || elementType == typeof (string))) {
            // convert the array to an array of strings

            var valueArry = val as IList;

            var values = (from object t in valueArry
                          select t ?? "\"\""
                          into item select item.ToString()).ToList();

            val = string.Format("[{0}]", string.Join(",", values));
          } else {
            // try to cast it
            val = string.Format("[{0}]", string.Join(",", (string[])val));
          }
        }

        pairs.Add(new KeyValuePair<string, string>(prop.Name.Camelize(), val.ToString()));
      }

      return pairs;
    }
  }
}
