using System.Collections.Generic;
using System.Text;
using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Infastructure.Commands;

namespace Deq.Search.Soe.Commands.Searches {
    /// <summary>
    ///     Command that handles the sitename search query string.
    ///     this is a full text attribute query
    /// </summary>
    public class ComposeMultiConditionQueryCommand : Command<string> {
        private readonly bool _includeAll;

        private readonly string _sitename;

        private readonly string[] _terms;

        public ComposeMultiConditionQueryCommand(string fieldname, string terms, bool includeAll) {
            _terms = terms.Split(new[]{','});
            _includeAll = includeAll;
            _sitename = fieldname;
        }

        private string FormatQueryString(IList<string> terms, bool includeAll) {
            var joiner = includeAll ? "AND" : "OR";

            var sb = new StringBuilder();
            const string lastRun = "upper({0}) LIKE upper('%{1}%')";
            var format = lastRun + " {2} ";

            for (var i = 0; i < terms.Count; i++) {
                if (i == terms.Count - 1) {
                    format = lastRun;
                }

                sb.AppendFormat(format, _sitename, terms[i].Trim(), joiner);
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
