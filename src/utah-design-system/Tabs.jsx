import * as RadixTabs from '@radix-ui/react-tabs';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * @typedef {Object} Root
 * @property {string} [className]
 */

/**
 * @param {Root & import('@radix-ui/react-tabs').TabsProps} props
 * @param {import('react').Ref<any>} forwardedRef
 * @returns {JSX.Element}
 */
function Root({ className, ...props }, forwardedRef) {
  return (
    <RadixTabs.Root
      className={twMerge(
        'flex',
        'data-[orientation=horizontal]:flex-col',
        className,
      )}
      ref={forwardedRef}
      {...props}
    />
  );
}

const ForwardedRoot = forwardRef(Root);
export { ForwardedRoot as Root };

/**
 * @typedef {Object} List
 * @property {import('tailwind-merge').ClassNameValue} [className]
 */

/**
 * @param {List & import('@radix-ui/react-tabs').TabsListProps} props
 * @returns {JSX.Element}
 */
export function List({ className, ...props }) {
  return (
    <RadixTabs.List
      className={twMerge(
        'flex border-slate-300 px-3',
        'data-[orientation=horizontal]:mb-2 data-[orientation=horizontal]:items-center data-[orientation=horizontal]:justify-evenly data-[orientation=horizontal]:border-b-2',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:border-l-2',
        className,
      )}
      {...props}
    />
  );
}

/**
 * @typedef {Object} Trigger
 * @property {import('tailwind-merge').ClassNameValue} [className]
 */

/**
 * @param {Trigger & import('@radix-ui/react-tabs').TabsTriggerProps} props
 * @returns {JSX.Element}
 */
export function Trigger({ className, children, ...props }) {
  return (
    <RadixTabs.Trigger
      className={twMerge(
        'hover:pointer group/tab relative min-h-[2.5rem] w-full font-bold',
        'data-[state=active]:before:content=[""] data-[state=active]:text-primary data-[state=active]:before:absolute data-[state=active]:before:z-10 data-[state=active]:before:block data-[state=active]:before:rounded-full data-[state=active]:before:bg-primary',
        'data-[orientation=horizontal]:mb-1.5 data-[orientation=horizontal]:flex-1 data-[orientation=horizontal]:data-[state=active]:before:-bottom-[.7rem] data-[orientation=horizontal]:data-[state=active]:before:left-0 data-[orientation=horizontal]:data-[state=active]:before:h-2 data-[orientation=horizontal]:data-[state=active]:before:w-full',
        'data-[orientation=vertical]:flex data-[orientation=vertical]:items-center data-[orientation=vertical]:justify-start',
        'data-[orientation=vertical]:data-[state=active]:before:-left-[1.05rem] data-[orientation=vertical]:data-[state=active]:before:top-0 data-[orientation=vertical]:data-[state=active]:before:h-full data-[orientation=vertical]:data-[state=active]:before:w-2',
        className,
      )}
      {...props}
    >
      <h5 className="inline-block rounded-full px-2 group-hover/tab:bg-slate-200">
        {children}
      </h5>
    </RadixTabs.Trigger>
  );
}

/**
 * @typedef {Object} Content
 * @property {import('tailwind-merge').ClassNameValue} [className]
 */

/**
 * @param {Content & import('@radix-ui/react-tabs').TabsContentProps} props
 * @returns {JSX.Element}
 */
export function Content({ className, ...props }) {
  return (
    <RadixTabs.Content className={twMerge('flex-1', className)} {...props} />
  );
}
