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

using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Commands.Searches;
using Deq.Search.Soe.Models.Configuration;
using NUnit.Framework;

namespace Deq.Search.Soe.Tests.Commands.Search {
  [TestFixture]
  public class BuildSiteSearchQueryCommandTests {
    [SetUp]
    public void SetupFixture() {
      ApplicationCache.Fields = new ApplicationFieldSettings {
        SiteName = "SN"
      };
    }

    [Test]
    public void QueryStringIsFormattedCorrectlyForMatchAll() {
      var command = new BuildSiteSearchQueryCommand("i am terms", true);
      command.Run();

      Assert.That(command.Result,
                  Is.EqualTo("SN LIKE upper('%i%') AND SN LIKE upper('%am%') AND SN LIKE upper('%terms%')"));
    }

    [Test]
    public void QueryStringIsFormattedCorrectlyForMatchSome() {
      var command = new BuildSiteSearchQueryCommand("i am terms", false);
      command.Run();

      Assert.That(command.Result,
                  Is.EqualTo("SN LIKE upper('%i%') OR SN LIKE upper('%am%') OR SN LIKE upper('%terms%')"));
    }
  }
}
