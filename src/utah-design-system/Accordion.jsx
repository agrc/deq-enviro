import * as Accordion from '@radix-ui/react-accordion';
import { CircleChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';

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

export function AccordionPanel({ title, numSelectedLayers, children }) {
  return (
    <Accordion.Item value={title} className="mb-1 overflow-hidden rounded-md">
      <Accordion.Header>
        <Accordion.Trigger
          className={
            'group relative flex w-full items-center justify-between bg-secondary px-3 py-2 text-left text-lg font-bold leading-5 text-white'
          }
        >
          {title} {numSelectedLayers > 0 && `(${numSelectedLayers})`}
          <CircleChevronDown
            label="chevron down"
            className="size-5 text-white transition group-data-[state=open]:rotate-180"
          />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden rounded-b-md bg-slate-100 data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down">
        <div className="px-5 py-4">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

AccordionPanel.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  numSelectedLayers: PropTypes.number,
};
