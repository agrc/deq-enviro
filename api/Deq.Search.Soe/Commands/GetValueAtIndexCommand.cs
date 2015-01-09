using System.Collections.Generic;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Models;
using ESRI.ArcGIS.Geodatabase;

namespace Deq.Search.Soe.Commands {
    /// <summary>
    ///     Gets the value from a row at the supplied indexes
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
                    continue;
                }

                // ReSharper disable RedundantCast
                results.Add(map.Field, (object)_row.Value[map.Index]);
                // ReSharper restore RedundantCast
            }

            Result = results;
        }
    }
}
