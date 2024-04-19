import '@arcgis/core/assets/esri/themes/light/main.css';
import '@utahdts/utah-design-system-header/css';
import '../src/index.css';
import { RemoteConfigContext } from '../src/contexts/RemoteConfigProvider';
import remoteConfigDefaultJson from '../src/remote_config_defaults.json';
import { InternalFirebaseContext } from '../src/contexts/FirebaseProvider';

function logEvent(eventName, eventParams) {
  console.log(`logEvent: ${eventName}`, eventParams);
}

/** @type {import('@storybook/react').Preview} */
const preview = {
  decorators: [
    (Story) => (
      <RemoteConfigContext.Provider
        value={Object.keys(remoteConfigDefaultJson).reduce((acc, current) => {
          return {
            ...acc,
            [current]: JSON.parse(remoteConfigDefaultJson[current]),
          };
        }, {})}
      >
        <InternalFirebaseContext.Provider value={{ logEvent }}>
          <div className="text-slate-700">
            <Story />
          </div>
        </InternalFirebaseContext.Provider>
      </RemoteConfigContext.Provider>
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
};

export default preview;
