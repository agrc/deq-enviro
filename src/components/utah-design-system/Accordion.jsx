import * as Accordion from '@radix-ui/react-accordion';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Icon from './Icon';

export function AccordionRoot({ type, children, ...props }) {
  return (
    <Accordion.Root {...props} type={type}>
      {children}
    </Accordion.Root>
  );
}

AccordionRoot.propTypes = {
  type: PropTypes.oneOf(['single', 'multiple']),
  children: PropTypes.node.isRequired,
};

export function AccordionPanel({ title, children }) {
  return (
    <Accordion.Item value={title} className="mb-1 overflow-hidden rounded-md">
      <Accordion.Header className="rounded-sm">
        <Accordion.Trigger
          className={clsx(
            'group flex w-full items-center justify-between rounded-b-none rounded-t-md',
            'bg-primary px-3 py-2 text-left text-lg font-bold leading-5 text-white'
          )}
        >
          {title}
          <Icon
            name={Icon.Names.circleChevronDown}
            label="chevron down"
            className="text-white transition group-data-[state=open]:rotate-180"
            size="sm"
          />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden rounded-b-md bg-gray-100 data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down">
        <div className="px-5 py-4">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

AccordionPanel.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
