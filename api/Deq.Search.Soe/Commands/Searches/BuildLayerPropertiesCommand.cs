using System.Collections.Generic;
using System.Linq;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Models.Search;

namespace Deq.Search.Soe.Commands.Searches {
    public class BuildLayerPropertiesCommand : Command<IEnumerable<SearchLayerProperties>> {
        private readonly List<string> _defQueries;

        private readonly List<int> _indexes;

        /// <summary>
        ///     Initializes a new instance of the <see cref="BuildLayerPropertiesCommand" /> class.
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
