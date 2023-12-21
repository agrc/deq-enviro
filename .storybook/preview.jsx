import '@arcgis/core/assets/esri/themes/light/main.css';
import '@utahdts/utah-design-system-header/css';
import '../src/index.css';
import { RemoteConfigContext } from '../src/contexts/RemoteConfigProvider';
import remoteConfigDefaultJson from '../src/remote_config_defaults.json';

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
        <div className="text-slate-700">
          <Story />
        </div>
      </RemoteConfigContext.Provider>
    ),
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
