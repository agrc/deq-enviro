import * as RadixPopover from '@radix-ui/react-popover';
import { XIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { isValidElement } from 'react';

export default function Popup({ children, trigger }) {
  return (
    <RadixPopover.Root>
      {/*
          Mark asChild true if the trigger is a component as opposed to a string.
          This prevents the console error about rendering a button within a button if the component
          contains a button.
        */}
      <RadixPopover.Trigger asChild={isValidElement(trigger)}>
        {trigger}
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          sideOffset={5}
          className="rounded-md border border-slate-400 bg-white px-3 py-2 shadow-md data-[state=open]:animate-fade-in"
        >
          {children}
          <RadixPopover.Arrow className="fill-slate-400 stroke-slate-400" />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

Popup.propTypes = {
  children: PropTypes.node.isRequired,
  trigger: PropTypes.node.isRequired,
};

export function CloseButton({ className }) {
  return (
    <RadixPopover.Close aria-label="close" className={className}>
      <XIcon className="size-4 text-slate-600" />
    </RadixPopover.Close>
  );
}

CloseButton.propTypes = {
  className: PropTypes.string,
};
