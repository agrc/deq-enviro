import * as RadixTooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import PropTypes from 'prop-types';

export default function Tooltip({ open, trigger, children, delayDuration }) {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root open={open} delayDuration={delayDuration}>
        <RadixTooltip.Trigger asChild>{trigger}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            sideOffset={5}
            className={clsx(
              'rounded-md bg-gray-600 px-3 py-2 text-white shadow-md',
              'data-[state=delayed-open]:animate-fade-in'
            )}
          >
            {children}
            <RadixTooltip.Arrow className="fill-gray-600" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}

Tooltip.propTypes = {
  open: PropTypes.bool,
  trigger: PropTypes.node.isRequired,
  /**
   * The content of the tooltip
   */
  children: PropTypes.node.isRequired,
  delayDuration: PropTypes.number,
};
