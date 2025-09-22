import { useFirebaseApp } from '@ugrc/utah-design-system';
import {
  fetchAndActivate,
  getAll,
  getRemoteConfig,
} from 'firebase/remote-config';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { BulletList } from 'react-content-loader';
import defaultConfig from '../remote_config_defaults.json';
import { RemoteConfigContext } from './RemoteConfigContext';

export default function RemoteConfigProvider({ children }) {
  const [remoteConfigValues, setRemoteConfigValues] = useState(null);
  const firebaseApp = useFirebaseApp();

  useEffect(() => {
    async function loadConfig() {
      console.log('loading remote config from firebase');
      const remoteConfig = getRemoteConfig(firebaseApp);
      remoteConfig.defaultConfig = defaultConfig;
      remoteConfig.settings = {
        minimumFetchIntervalMillis: 10000,
        fetchTimeoutMillis: 10000,
      };

      if (!import.meta.env.DEV) {
        await fetchAndActivate(remoteConfig);
      }
      // use for testing loader...
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      const all = getAll(remoteConfig);

      setRemoteConfigValues({
        queryLayers: JSON.parse(all.queryLayers.asString()),
        relatedTables: JSON.parse(all.relatedTables.asString()),
        relationshipClasses: JSON.parse(all.relationshipClasses.asString()),
        version: all.version.asNumber(),
      });

      return remoteConfig;
    }

    if (!remoteConfigValues) loadConfig();
  }, [firebaseApp, remoteConfigValues]);

  if (!remoteConfigValues) {
    console.log('loading remote config');

    return <BulletList className="h-80 w-full p-2" />;
  }

  console.log('remote config loaded', remoteConfigValues);

  return (
    <RemoteConfigContext.Provider value={remoteConfigValues}>
      {children}
    </RemoteConfigContext.Provider>
  );
}

RemoteConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useRemoteConfigValues() {
  const context = useContext(RemoteConfigContext);

  if (!context) {
    throw new Error(
      'useRemoteConfigValues must be used within a RemoteConfigProvider',
    );
  }

  return context;
}
