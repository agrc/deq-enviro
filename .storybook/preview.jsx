import '@arcgis/core/assets/esri/themes/light/main.css';
import { FirebaseAppProvider } from '@ugrc/utah-design-system';
import '@utahdts/utah-design-system-header/css';
import FirebaseProvider from '../src/contexts/FirebaseProvider.jsx';
import { RemoteConfigContext } from '../src/contexts/RemoteConfigContext';
import '../src/index.css';
import remoteConfigDefaultJson from '../src/remote_config_defaults.json';

/** @type {import('@storybook/react-vite').Preview} */
const preview = {
  decorators: [
    (Story) => (
      <FirebaseAppProvider
        config={JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)}
      >
        <FirebaseProvider>
          <RemoteConfigContext.Provider
            value={Object.keys(remoteConfigDefaultJson).reduce(
              (acc, current) => {
                return {
                  ...acc,
                  [current]: JSON.parse(remoteConfigDefaultJson[current]),
                };
              },
              {},
            )}
          >
            <div className="text-slate-700">
              <Story />
            </div>
          </RemoteConfigContext.Provider>
        </FirebaseProvider>
      </FirebaseAppProvider>
    ),
  ],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },

  tags: ['autodocs'],
};

export default preview;
