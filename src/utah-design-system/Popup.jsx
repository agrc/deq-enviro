import * as RadixPopover from '@radix-ui/react-popover';
import { isValidElement } from 'react';
import Icon from './Icon';

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} props.trigger
 * @returns {JSX.Element}
 */
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

/**
 * @param {object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function CloseButton({ className }) {
  return (
    <RadixPopover.Close className={className}>
      <Icon name="close" label="close" size="xs" className="text-slate-600" />
    </RadixPopover.Close>
  );
}
