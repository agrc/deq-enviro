using System.Text;
using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Infastructure.Commands;

namespace Deq.Search.Soe.Commands.Searches {
    /// <summary>
    ///     Command that handles the sitename search query string.
    ///     this is a full text attribute query
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
