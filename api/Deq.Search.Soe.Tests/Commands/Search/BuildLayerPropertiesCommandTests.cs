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
using Deq.Search.Soe.Commands.Searches;
using Deq.Search.Soe.Models.Search;
using Deq.Search.Soe.Tests.Extensions;
using NUnit.Framework;

namespace Deq.Search.Soe.Tests.Commands.Search {
  public class BuildLayerPropertiesCommandTests {
    [Test]
    public void ZipsLayerIdAndDefinitionQueryTogether() {
      var ids = new object[] {
        1, 5
      };
      var queries = new object[] {
        "1", "5"
      };

      var command = new BuildLayerPropertiesCommand(ids, queries);
      command.Run();

      command.Result.CollectionAsJsonAreEqual(new List<SearchLayerProperties> {
        new SearchLayerProperties(1, "1"),
        new SearchLayerProperties(5, "5")
      });
    }

    [Test]
    public void ZipsLayerIdAndDefinitionQueryTogetherWithNulls() {
      var ids = new object[] {
        1, 5
      };
      var queries = new object[] {
        null, "5", null
      };

      var command = new BuildLayerPropertiesCommand(ids, queries);
      command.Run();

      command.Result.CollectionAsJsonAreEqual(new List<SearchLayerProperties> {
        new SearchLayerProperties(1, null),
        new SearchLayerProperties(5, "5")
      });
    }
  }
}
