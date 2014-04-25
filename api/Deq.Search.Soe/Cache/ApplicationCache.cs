﻿#region license
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
using System.Collections.ObjectModel;
using Deq.Search.Soe.Models;
using Deq.Search.Soe.Models.Configuration;
using ESRI.ArcGIS.Geodatabase;

namespace Deq.Search.Soe.Cache {
  /// <summary>
  ///   The global cache for the application
  /// </summary>
  public static class ApplicationCache {
    /// <summary>
    ///   The property value index map
    /// </summary>
    public static Dictionary<IFeatureClass, IndexFieldMap> PropertyValueIndexMap;

    /// <summary>
    ///   Gets or sets the feature class index map.
    /// </summary>
    /// <value>
    ///   The feature class index map.
    /// </value>
    public static Collection<FeatureClassIndexMap> FeatureClassIndexMap { get; set; }

    /// <summary>
    ///   Gets or sets the fields used in the application.
    /// </summary>
    /// <value>
    ///   The fields.
    /// </value>
    public static ApplicationFieldSettings Fields { get; set; }
  }
}
