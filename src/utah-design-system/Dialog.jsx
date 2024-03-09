import * as DialogPrimitive from '@radix-ui/react-dialog';
import { forwardRef } from 'react';
import Icon from './Icon';
import { twMerge } from 'tailwind-merge';
import Button from './Button';

export const Dialog = DialogPrimitive.Root;

/**
 * @param {Object & import('./Button').default} props
 * @returns {JSX.Element}
 */
export function DialogTrigger({ children, ...props }) {
  return (
    <DialogPrimitive.Trigger asChild>
      <Button {...props}>{children}</Button>
    </DialogPrimitive.Trigger>
  );
}

/**
 * @param {Object & DialogPrimitive.PrimitiveDivProps} props
 * @returns {JSX.Element}
 */
export function DialogTitle({ children, className, ...props }) {
  return (
    <DialogPrimitive.Title className={twMerge('pb-4', className)} {...props}>
      {children}
    </DialogPrimitive.Title>
  );
}

/**
 * @param {Object & DialogPrimitive.DialogContentProps} props
 * @param {import('react').Ref<any>} forwardedRef
 * @returns {JSX.Element}
 */
function Content({ children, ...props }, forwardedRef) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-slate-800/30 backdrop-blur-sm data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <DialogPrimitive.Content
        className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 animate-pop-in rounded-md bg-white p-6 shadow-md focus:outline-none"
        {...props}
        ref={forwardedRef}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-3 top-3"
          aria-label="Close"
        >
          <Icon name="x" className="h-6 w-6" label="close" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogContent = forwardRef(Content);
