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

using System.Text;
using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Infastructure.Commands;

namespace Deq.Search.Soe.Commands.Searches {
  /// <summary>
  ///   Command that handles the sitename search query string.
  ///   this is a full text attribute query
  /// </summary>
  public class BuildSiteSearchQueryCommand : Command<string> {
    private readonly bool _includeAll;

    private readonly string _sitename;

    private readonly string _terms;

    public BuildSiteSearchQueryCommand(string terms, bool includeAll) {
      _terms = terms;
      _includeAll = includeAll;
      _sitename = ApplicationCache.Fields.SiteName;
    }

    private string FormatQueryString(string terms, bool includeAll) {
      var joiner = includeAll ? "AND" : "OR";
      var words = terms.Split(new[] {
        ' '
      });

      var sb = new StringBuilder();
      const string lastRun = "{0} LIKE upper('%{1}%')";
      var format = lastRun + " {2} ";

      for (var i = 0; i < words.Length; i++) {
        if (i == words.Length - 1) {
          format = lastRun;
        }

        sb.AppendFormat(format, _sitename, words[i], joiner);
      }

      return sb.ToString();
    }

    protected override void Execute() {
      Result = FormatQueryString(_terms, _includeAll);
    }

    public override string ToString() {
      return string.Format("{0}, IncludeAll: {1}, Sitename: {2}, Terms: {3}", "BuildSiteSearchQueryCommand",
                           _includeAll, _sitename, _terms);
    }
  }
}
