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

using System.Collections.ObjectModel;
using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Models;

namespace Deq.Search.Soe.Commands {
  /// <summary>
  ///   Adds the field index property to the feature class to index map
  /// </summary>
  public class UpdateLayerMapWithFieldIndexMapCommand : Command {
    private readonly Collection<FeatureClassIndexMap> _map;

    public UpdateLayerMapWithFieldIndexMapCommand(Collection<FeatureClassIndexMap> map) {
      _map = map;
    }

    protected override void Execute() {
      foreach (var item in _map) {
        item.FieldMap = CommandExecutor.ExecuteCommand(new FindIndexByFieldNameCommand(item.FeatureClass,
                                                                                       ApplicationCache.Fields
                                                                                                       .ReturnFields));
      }
    }

    public override string ToString() {
      return string.Format("{0}, Map count: {1}", "UpdateLayerMapWIthFieldIndexMapCommand", _map.Count);
    }
  }
}
