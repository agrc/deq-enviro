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
using System.Linq;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Models.Search;

namespace Deq.Search.Soe.Commands.Searches {
  public class BuildLayerPropertiesCommand : Command<IEnumerable<SearchLayerProperties>> {
    private readonly List<string> _defQueries;

    private readonly List<int> _indexes;

    /// <summary>
    ///   Initializes a new instance of the <see cref="BuildLayerPropertiesCommand" /> class.
    /// </summary>
    /// <param name="layerIndexes">The layer indexes of their spot in the map.</param>
    /// <param name="definitionQueries">The definition queries.</param>
    public BuildLayerPropertiesCommand(IEnumerable<object> layerIndexes, IEnumerable<object> definitionQueries) {
      _indexes = layerIndexes.Cast<int>().ToList();
      _defQueries = definitionQueries.Cast<string>().ToList();
    }

    protected override void Execute() {
      Result = _indexes.Zip(_defQueries, (id, defQuery) => new SearchLayerProperties(id, defQuery));
    }

    public override string ToString() {
      return string.Format("{0}, Indexes: {1}, DefQueries: {2}", "BuildLayerPropertiesCommand", _indexes,
                           _defQueries);
    }
  }
}
