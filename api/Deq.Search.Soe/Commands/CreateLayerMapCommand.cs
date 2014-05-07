using System;
using System.Collections.ObjectModel;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Models;
using ESRI.ArcGIS.Carto;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Server;

namespace Deq.Search.Soe.Commands {
    /// <summary>
    ///     Maps the layers in the host soe mxd to an index
    /// </summary>
    public class CreateLayerMapCommand : Command<Collection<FeatureClassIndexMap>> {
        private readonly IServerObjectHelper _serverObjectHelper;

        private IMapServerDataAccess _dataAccess;

        private string _defaultMapName;

        /// <summary>
        ///     Initializes a new instance of the <see cref="CreateLayerMapCommand" /> class.
        /// </summary>
        /// <param name="serverObjectHelper">The server object helper.</param>
        public CreateLayerMapCommand(IServerObjectHelper serverObjectHelper) {
            _serverObjectHelper = serverObjectHelper;
        }

        /// <summary>
        ///     code to execute when command is run.
        /// </summary>
        /// <exception cref="System.NullReferenceException">Map service was not found.</exception>
        protected override void Execute() {
            var mapServer = _serverObjectHelper.ServerObject as IMapServer3;

            if (mapServer == null) {
#if !DEBUG
                Logger.LogMessage(ServerLogger.msgType.error, "CreateLayerMapCommand.Execute", MessageCode, "Map service not found.");
#endif
                throw new NullReferenceException("Map service was not found.");
            }

            _dataAccess = (IMapServerDataAccess)mapServer;

            if (_dataAccess == null) {
#if !DEBUG
                Logger.LogMessage(ServerLogger.msgType.error, "CreateLayerMapCommand.Execute", MessageCode, "Problem accessing IMapServerDataAccess object.");
#endif
                throw new NullReferenceException("Problem accessing IMapServerDataAccess object.");
            }

            var result = new Collection<FeatureClassIndexMap>();

            _defaultMapName = mapServer.DefaultMapName;
#if !DEBUG
            Logger.LogMessage(ServerLogger.msgType.infoStandard, "CreateLayerMapCommand.Execute", MessageCode, "default map name: {0}".With(_defaultMapName));
#endif
            var layerInfos = mapServer.GetServerInfo(_defaultMapName).MapLayerInfos;

            var count = layerInfos.Count;

            for (var i = 0; i < count; i++) {
                var layerInfo = layerInfos.Element[i];
#if !DEBUG
                Logger.LogMessage(ServerLogger.msgType.infoStandard, "CreateLayerMapCommand.Execute", MessageCode, "layerInfo name: {0}".With(layerInfo.Name));
#endif
                if (layerInfo.IsComposite) {
                    continue;
                }

                result.Add(new FeatureClassIndexMap(i, GetFeatureClassFromMap(i)));
            }

            CommandExecutor.ExecuteCommand(new UpdateLayerMapWithFieldIndexMapCommand(result));

            Result = result;
        }

        private IFeatureClass GetFeatureClassFromMap(int layerIndex) {
            var featureClass = _dataAccess.GetDataSource(_defaultMapName, layerIndex) as IFeatureClass;

            if (featureClass == null) {
#if !DEBUG
               Logger.LogMessage(ServerLogger.msgType.error, "CreateLayerMapCommand.GetFeatureClassFromMap", MessageCode, "featureclass cannot be null: {0}".With(layerIndex));
#endif
                throw new NullReferenceException("FeatureClass cannot be null");
            }

            return featureClass;
        }

        public override string ToString() {
            return string.Format("{0}, DefaultMapName: {1}", "CreateLayerMapCommand", _defaultMapName);
        }
    }
}
