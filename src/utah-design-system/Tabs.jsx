import * as RadixTabs from '@radix-ui/react-tabs';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

/** Root component for Tabs */
function Root({ className, ...props }, forwardedRef) {
  return (
    <RadixTabs.Root
      className={twMerge('flex', 'orientation-horizontal:flex-col', className)}
      ref={forwardedRef}
      {...props}
    />
  );
}

Root.propTypes = {
  className: PropTypes.string,
};

const ForwardedRoot = forwardRef(Root);
ForwardedRoot.propTypes = Root.propTypes;
export { ForwardedRoot as Root };

/** List component for Tabs */
export function List({ className, ...props }) {
  return (
    <RadixTabs.List
      className={twMerge(
        'flex border-slate-300 px-3',
        'orientation-horizontal:mb-2 orientation-horizontal:items-center orientation-horizontal:justify-evenly orientation-horizontal:border-b-2',
        'orientation-vertical:flex-col orientation-vertical:items-start orientation-vertical:border-l-2',
        className,
      )}
      {...props}
    />
  );
}

List.propTypes = {
  className: PropTypes.string,
};

/** Trigger component for Tabs */
export function Trigger({ className, children, ...props }) {
  return (
    <RadixTabs.Trigger
      className={twMerge(
        'hover:pointer group/tab relative min-h-10 w-full font-bold',
        'data-[state=active]:before:content=[""] data-[state=active]:text-primary data-[state=active]:before:bg-primary data-[state=active]:before:absolute data-[state=active]:before:z-10 data-[state=active]:before:block data-[state=active]:before:rounded-full',
        'orientation-horizontal:mb-1.5 orientation-horizontal:flex-1 orientation-horizontal:data-[state=active]:before:bottom-[-0.7rem] orientation-horizontal:data-[state=active]:before:left-0 orientation-horizontal:data-[state=active]:before:h-2 orientation-horizontal:data-[state=active]:before:w-full',
        'orientation-vertical:flex orientation-vertical:items-center orientation-vertical:justify-start',
        'orientation-vertical:data-[state=active]:before:top-0 orientation-vertical:data-[state=active]:before:left-[-1.05rem] orientation-vertical:data-[state=active]:before:h-full orientation-vertical:data-[state=active]:before:w-2',
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center justify-center rounded-full px-2 text-lg group-hover/tab:bg-slate-200">
        {children}
      </span>
    </RadixTabs.Trigger>
  );
}

Trigger.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

/** Content component for Tabs */
export function Content({ className, ...props }) {
  return (
    <RadixTabs.Content
      className={twMerge('min-h-0 flex-1', className)}
      {...props}
    />
  );
}

Content.propTypes = {
  className: PropTypes.string,
};
