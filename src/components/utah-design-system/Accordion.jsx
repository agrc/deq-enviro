import * as Accordion from '@radix-ui/react-accordion';
import PropTypes from 'prop-types';

export function AccordionRoot({ type, children }) {
  return <Accordion.Root type={type}>{children}</Accordion.Root>;
}

AccordionRoot.propTypes = {
  type: PropTypes.oneOf(['single', 'multiple']),
  children: PropTypes.node.isRequired,
};

export function AccordionPanel({ title, children }) {
  return (
    <Accordion.Item value={title} className="mb-1 overflow-hidden rounded-md">
      <Accordion.Header className="rounded-sm">
        <Accordion.Trigger className="group w-full justify-between rounded-b-none rounded-t-md border-[--primary-color] bg-[--primary-color] px-2 py-1 text-left text-lg leading-5 text-white active:transform-none active:shadow-none">
          {title}
          <span
            className="utds-icon-before-circle-chevron-down flex content-center justify-center text-base text-white transition before:mr-0 before:content-['L'] group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down">
        <div className="rounded-b-md border-b border-l border-r border-gray-300 p-2">
          {children}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

AccordionPanel.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
