import Icon from './Icon';
import Tooltip from './Tooltip';

export default {
  title: 'Utah Design System/Tooltip',
  component: Tooltip,
};

export const Default = () => (
  <div className="flex h-40 w-60 flex-col justify-between bg-gray-100">
    <Tooltip trigger="Hover me" open={true}>
      Hello
    </Tooltip>
    <Tooltip trigger={<Icon name={Icon.Names.help} label="help" />}>
      A bunch of text that will wrap at some point
    </Tooltip>
  </div>
);
