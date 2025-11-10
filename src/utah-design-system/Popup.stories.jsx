import { HelpCircleIcon } from 'lucide-react';
import Button from './Button';
import Popup, { CloseButton } from './Popup';

export default {
  title: 'Utah Design System/Popup',
  component: Popup,
};

export const Default = () => (
  <div className="flex h-80 w-60 flex-col items-center justify-between bg-slate-100">
    <Popup trigger={<Button>trigger with button</Button>}>
      <div className="flex flex-row">
        <div>
          trigger with button
          <p>more content</p>
          <p>more content</p>
        </div>
        <CloseButton className="ml-2 self-start" />
      </div>
    </Popup>
    <Popup trigger={<HelpCircleIcon className="size-5" label="help" />}>
      Icon
    </Popup>
  </div>
);
