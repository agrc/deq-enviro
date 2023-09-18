import '@arcgis/core/assets/esri/themes/light/main.css';
import '@utahdts/utah-design-system-header/css';
import '../src/index.css';

/** @type {import('@storybook/react').Preview} */
const preview = {
  decorators: [
    (Story) => (
      <div className="text-slate-700">
        <Story />
      </div>
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
