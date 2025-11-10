import { HelpCircleIcon } from 'lucide-react';
import Tooltip from './Tooltip';

export default {
  title: 'Utah Design System/Tooltip',
  component: Tooltip,
};

export const Default = () => (
  <div className="flex h-40 w-60 flex-col items-center justify-between bg-slate-100">
    <Tooltip trigger={<span>trigger with span</span>}>
      trigger with span
    </Tooltip>
    <Tooltip trigger="plain string trigger">plain string trigger</Tooltip>
    <Tooltip trigger={<HelpCircleIcon className="size-4" label="help" />}>
      Icon
    </Tooltip>
  </div>
);
