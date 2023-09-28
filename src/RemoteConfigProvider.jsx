import { fetchAndActivate, getRemoteConfig } from 'firebase/remote-config';
import { BulletList } from 'react-content-loader';
import {
  RemoteConfigProvider as RemoteConfigProviderRF,
  useInitRemoteConfig,
} from 'reactfire';
import defaultConfig from './remote_config_defaults.json';

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export default function RemoteConfigProvider({ children }) {
  const { status, data: remoteConfigInstance } = useInitRemoteConfig(
    async (firebaseApp) => {
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

      return remoteConfig;
    },
  );

  if (status === 'loading') {
    console.log('loading remote config');

    return <BulletList className="h-80 w-full p-2" />;
  }

  console.log('remote config loaded');

  return (
    <RemoteConfigProviderRF sdk={remoteConfigInstance}>
      {children}
    </RemoteConfigProviderRF>
  );
}
