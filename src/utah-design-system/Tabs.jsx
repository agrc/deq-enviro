import * as RadixTabs from '@radix-ui/react-tabs';
import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';

export const Root = forwardRef(function Root(
  { className, ...props },
  forwardedRef,
) {
  return (
    <RadixTabs.Root
      className={twMerge(
        'flex w-full h-full',
        'data-[orientation=horizontal]:flex-col',
        className,
      )}
      ref={forwardedRef}
      {...props}
    />
  );
});
Root.propTypes = {
  className: PropTypes.string,
};

export const List = ({ className, ...props }) => (
  <RadixTabs.List
    className={twMerge(
      'px-3 flex border-slate-300',
      'data-[orientation=horizontal]:border-b-2 data-[orientation=horizontal]:justify-evenly data-[orientation=horizontal]:mb-2 data-[orientation=horizontal]:items-center',
      'data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-l-2 data-[orientation=vertical]:items-start',
      className,
    )}
    {...props}
  />
);
List.propTypes = {
  className: PropTypes.string,
};

export const Trigger = ({ className, children, ...props }) => (
  <RadixTabs.Trigger
    className={twMerge(
      'relative hover:pointer group/tab font-bold min-h-[2.5rem] w-full',
      'data-[state=active]:text-primary data-[state=active]:before:content=[""] data-[state=active]:before:absolute data-[state=active]:before:z-10 data-[state=active]:before:block data-[state=active]:before:rounded-full data-[state=active]:before:bg-primary',
      'data-[orientation=horizontal]:data-[state=active]:before:-bottom-[.7rem] data-[orientation=horizontal]:data-[state=active]:before:left-0 data-[orientation=horizontal]:data-[state=active]:before:h-2 data-[orientation=horizontal]:data-[state=active]:before:w-full data-[orientation=horizontal]:flex-1 data-[orientation=horizontal]:mb-1.5',
      'data-[orientation=vertical]:flex data-[orientation=vertical]:justify-start data-[orientation=vertical]:items-center',
      'data-[orientation=vertical]:data-[state=active]:before:-left-[1.05rem] data-[orientation=vertical]:data-[state=active]:before:top-0 data-[orientation=vertical]:data-[state=active]:before:h-full data-[orientation=vertical]:data-[state=active]:before:w-2',
      className,
    )}
    {...props}
  >
    <h5 className="inline-block group-hover/tab:bg-slate-200 px-2 rounded-full">
      {children}
    </h5>
  </RadixTabs.Trigger>
);
Trigger.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export const Content = ({ className, ...props }) => (
  <RadixTabs.Content className={twMerge('flex-1 ml-7', className)} {...props} />
);
Content.propTypes = {
  className: PropTypes.string,
};
