import * as RadixTabs from '@radix-ui/react-tabs';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

/** Root component for Tabs */
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
        'data-[orientation=horizontal]:mb-2 data-[orientation=horizontal]:items-center data-[orientation=horizontal]:justify-evenly data-[orientation=horizontal]:border-b-2',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:border-l-2',
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
        'hover:pointer group/tab relative min-h-[2.5rem] w-full font-bold',
        'data-[state=active]:before:content=[""] data-[state=active]:text-primary data-[state=active]:before:absolute data-[state=active]:before:z-10 data-[state=active]:before:block data-[state=active]:before:rounded-full data-[state=active]:before:bg-primary',
        'data-[orientation=horizontal]:mb-1.5 data-[orientation=horizontal]:flex-1 data-[orientation=horizontal]:data-[state=active]:before:-bottom-[.7rem] data-[orientation=horizontal]:data-[state=active]:before:left-0 data-[orientation=horizontal]:data-[state=active]:before:h-2 data-[orientation=horizontal]:data-[state=active]:before:w-full',
        'data-[orientation=vertical]:flex data-[orientation=vertical]:items-center data-[orientation=vertical]:justify-start',
        'data-[orientation=vertical]:data-[state=active]:before:-left-[1.05rem] data-[orientation=vertical]:data-[state=active]:before:top-0 data-[orientation=vertical]:data-[state=active]:before:h-full data-[orientation=vertical]:data-[state=active]:before:w-2',
        className,
      )}
      {...props}
    >
      <h5 className="inline-flex items-center justify-center rounded-full px-2 group-hover/tab:bg-slate-200">
        {children}
      </h5>
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
