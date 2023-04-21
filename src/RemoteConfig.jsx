import { activate, fetchConfig, getRemoteConfig } from 'firebase/remote-config';
import PropTypes from 'prop-types';
import { RemoteConfigProvider, useInitRemoteConfig } from 'reactfire';
import defaultConfig from './remote_config_defaults.json';

export default function RemoteConfig({ children }) {
  const { status, data: remoteConfigInstance } = useInitRemoteConfig(
    async (firebaseApp) => {
      const remoteConfig = getRemoteConfig(firebaseApp);
      remoteConfig.defaultConfig = defaultConfig;
      remoteConfig.settings = {
        minimumFetchIntervalMillis: 10000,
        fetchTimeoutMillis: 10000,
      };

      // immediately activate the latest cached config to help with initial load performance
      await activate(remoteConfig);

      // fetch new configs for the next load
      fetchConfig(remoteConfig);

      return remoteConfig;
    }
  );

  if (status === 'loading') {
    console.log('loading remote config');

    return <span>getting configs...</span>;
  }

  console.log('remote config loaded');

  return (
    <RemoteConfigProvider sdk={remoteConfigInstance}>
      {children}
    </RemoteConfigProvider>
  );
}

RemoteConfig.propTypes = {
  children: PropTypes.node,
};
