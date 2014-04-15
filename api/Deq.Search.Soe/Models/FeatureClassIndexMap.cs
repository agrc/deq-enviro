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

using System.Collections.Generic;
using ESRI.ArcGIS.Geodatabase;

namespace Deq.Search.Soe.Models {
  public class FeatureClassIndexMap {
    /// <summary>
    ///   Initializes a new instance of the <see cref="FeatureClassIndexMap" /> class.
    /// </summary>
    /// <param name="index">The index.</param>
    /// <param name="featureClass">The feature class.</param>
    public FeatureClassIndexMap(int index, IFeatureClass featureClass) {
      Index = index;
      FeatureClass = featureClass;
    }

    /// <summary>
    ///   Gets or sets the index of the layer in the map document.
    /// </summary>
    /// <value>
    ///   The index.
    /// </value>
    public int Index { get; set; }

    /// <summary>
    ///   Gets or sets the feature class.
    /// </summary>
    /// <value>
    ///   The feature class reference of the layer in the mxd.
    /// </value>
    public IFeatureClass FeatureClass { get; set; }

    /// <summary>
    ///   Gets or sets the field map.
    /// </summary>
    /// <value>
    ///   The field map. Where the key is the field, and the index field map
    ///   is the field and index
    /// </value>
    public Dictionary<string, IndexFieldMap> FieldMap { get; set; }
  }
}
