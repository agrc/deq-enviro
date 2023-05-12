import { fetchAndActivate, getRemoteConfig } from 'firebase/remote-config';
import PropTypes from 'prop-types';
import { BulletList } from 'react-content-loader';
import {
  RemoteConfigProvider as RemoteConfigProviderRF,
  useInitRemoteConfig,
} from 'reactfire';
import defaultConfig from './remote_config_defaults.json';

export default function RemoteConfigProvider({ children }) {
  const { status, data: remoteConfigInstance } = useInitRemoteConfig(
    async (firebaseApp) => {
      const remoteConfig = getRemoteConfig(firebaseApp);
      remoteConfig.defaultConfig = defaultConfig;
      remoteConfig.settings = {
        minimumFetchIntervalMillis: 10000,
        fetchTimeoutMillis: 10000,
      };

      await fetchAndActivate(remoteConfig);
      // use for testing loader...
      // await new Promise((resolve) => setTimeout(resolve, 3000));

      return remoteConfig;
    }
  );

  if (status === 'loading') {
    console.log('loading remote config');

    return <BulletList className="p-2" />;
  }

  console.log('remote config loaded');

  return (
    <RemoteConfigProviderRF sdk={remoteConfigInstance}>
      {children}
    </RemoteConfigProviderRF>
  );
}

RemoteConfigProvider.propTypes = {
  children: PropTypes.node,
};
