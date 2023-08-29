import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import Button from '../utah-design-system/Button';
import Icon from '../utah-design-system/Icon';
import SimpleTable from '../utah-design-system/SimpleTable';
import * as Tabs from '../utah-design-system/Tabs';
import { getAlias } from '../utils';

const buttonClasses = 'border-none px-2 my-1';

const Identify = forwardRef(function Identify(
  { attributes, fields, onBack, links },
  forwardedRef,
) {
  const columns = [
    {
      accessorKey: 'field',
      size: 80,
    },
    {
      accessorKey: 'value',
      size: 50,
    },
  ];

  const data = Object.entries(attributes).map(([field, value]) => ({
    field: getAlias(field, fields),
    value, // TODO: handle formatting dates?
  }));

  const substituteAttributes = (url) =>
    url.replace(/{([^}]+)}/g, (_, key) => attributes[key]);

  return (
    <Tabs.Root
      className="min-h-0 flex-1 border-l-0 text-sm"
      defaultValue="attributes"
      ref={forwardedRef}
      orientation="vertical"
    >
      <Tabs.List className="data-[orientation=vertical]:border-l-0">
        <Tabs.Trigger value="attributes">Attributes</Tabs.Trigger>
        <Tabs.Trigger value="related">Related Records</Tabs.Trigger>
        <Tabs.Trigger value="links">Links</Tabs.Trigger>
        <Button className={buttonClasses} onClick={() => {}} disabled>
          <Icon
            name={Icon.Names.search}
            className="mr-2"
            label="zoom to feature"
          />{' '}
          Zoom to feature
        </Button>
        <Button className={buttonClasses} onClick={onBack}>
          <Icon name={Icon.Names.arrowLeft} className="mr-2" label="back" />
          Back to results
        </Button>
      </Tabs.List>
      <Tabs.Content value="attributes">
        <SimpleTable
          caption="Attributes"
          className="h-full overflow-y-auto border-l border-l-slate-300"
          columns={columns}
          data={data}
          hideHeaders
        />
      </Tabs.Content>
      <Tabs.Content value="related">Not yet implemented</Tabs.Content>
      <Tabs.Content value="links">
        <div className="flex h-full flex-col justify-around">
          {links.map(({ text, url }) => (
            <Button
              key={text}
              href={substituteAttributes(url)}
              size="lg"
              external
            >
              {text}
            </Button>
          ))}
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
});

Identify.propTypes = {
  attributes: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  onBack: PropTypes.func.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default Identify;
