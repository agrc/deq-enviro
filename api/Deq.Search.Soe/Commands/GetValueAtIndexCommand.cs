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
using System.Collections.ObjectModel;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Models;
using ESRI.ArcGIS.Geodatabase;

namespace Deq.Search.Soe.Commands {
  /// <summary>
  ///   Gets the value from a row at the supplied indexes
  /// </summary>
  public class GetValueAtIndexCommand : Command<IEnumerable<KeyValuePair<string, object>>> {
    private readonly IEnumerable<IndexFieldMap> _indexes;

    private readonly IObject _row;

    public GetValueAtIndexCommand(IEnumerable<IndexFieldMap> indexes, IObject row) {
      _indexes = indexes;
      _row = row;
    }

    public bool IncludeShape { get; set; }

    public override string ToString() {
      return string.Format("{0}, Fields: {1}", "GetValueForFieldIndexCommand", string.Join(",", _indexes));
    }

    protected override void Execute() {
      var results = new Dictionary<string, object>();

      foreach (var map in _indexes) {
        if (map.Index < 0) {
          results.Add(map.Field, null);
        }

// ReSharper disable RedundantCast
        results.Add(map.Field, (object)_row.Value[map.Index]);
// ReSharper restore RedundantCast
      }

      Result = results;
    }
  }
}
