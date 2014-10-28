using System.Collections.ObjectModel;
using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Models;

namespace Deq.Search.Soe.Commands {
    /// <summary>
    ///     Adds the field index property to the feature class to index map
    /// </summary>
    public class UpdateLayerMapWithFieldIndexMapCommand : Command {
        private readonly Collection<FeatureClassIndexMap> _map;

        public UpdateLayerMapWithFieldIndexMapCommand(Collection<FeatureClassIndexMap> map) {
            _map = map;
        }

        protected override void Execute() {
            foreach (var item in _map) {
                item.FieldMap = CommandExecutor.ExecuteCommand(new FindIndexByFieldNameCommand(item.FeatureClass,
                                                                                               ApplicationCache.Settings
                                                                                                               .ReturnFields));
            }
        }

        public override string ToString() {
            return string.Format("{0}, Map count: {1}", "UpdateLayerMapWIthFieldIndexMapCommand", _map.Count);
        }
    }
}
