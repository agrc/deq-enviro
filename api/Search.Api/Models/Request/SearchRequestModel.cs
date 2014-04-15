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

namespace Search.Api.Models.Request {
  /// <summary>
  ///   A model for the incoming json from the web app.
  ///   Determines how to search the data
  /// </summary>
  public class SearchRequestModel {
    /// <summary>
    ///   Gets or sets the query layers.
    /// </summary>
    /// <value>
    ///   The query layers involved in the search.
    /// </value>
    public List<QueryLayer> QueryLayers { get; set; }

    /// <summary>
    ///   Gets or sets the geometry.
    /// </summary>
    /// <value>
    ///   The geometry used to search in the query.
    /// </value>
    public Geometry Geometry { get; set; }

    /// <summary>
    ///   Gets or sets the name of the site.
    /// </summary>
    /// <value>
    ///   The sitename model used to search the sitename field.
    /// </value>
    public SiteName SiteName { get; set; }

    /// <summary>
    ///   Gets or sets the program identifier.
    /// </summary>
    /// <value>
    ///   The program identifier.
    /// </value>
    public string ProgramId { get; set; }
  }
}
