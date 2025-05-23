import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { useSearchMachine } from '../contexts/SearchMachineContext';
import { useFirebase } from '../contexts/useFirebase';
import useMap from '../contexts/useMap';
import Button from '../utah-design-system/Button';
import Icon from '../utah-design-system/Icon';
import Link from '../utah-design-system/Link';
import SimpleTable from '../utah-design-system/SimpleTable';
import * as Tabs from '../utah-design-system/Tabs';
import RelatedRecords from './RelatedRecords';

const buttonClasses = 'border-none w-full my-1 justify-start px-2 text-left';

const urlRegex = /^https?:\/\/.*/;
export function LinkDetectingCell({ getValue }) {
  // if this is a link, return an anchor tag
  const value = getValue();
  if (typeof value === 'string' && urlRegex.test(value)) {
    return (
      <Link external href={value}>
        link
      </Link>
    );
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
}

LinkDetectingCell.propTypes = {
  getValue: PropTypes.func.isRequired,
};

function getValue(fieldName, value, fields) {
  const fieldDef = fields.find((field) => field.name === fieldName);

  if (fieldDef?.type === 'esriFieldTypeDate') {
    return new Date(/** @type {number} */ (value)).toLocaleDateString();
  }

  return value;
}

function Identify(
  { attributes, fields, geometry, links, onBack, relationshipClasses },
  forwardedRef,
) {
  const { zoom } = useMap();
  const { logEvent } = useFirebase();
  const send = useSearchMachine()[1];

  const columns = [
    {
      accessorKey: 'field',
      size: 80,
    },
    {
      accessorKey: 'value',
      size: 50,
      cell: LinkDetectingCell,
    },
  ];

  const data = fields.map((config) => ({
    field: config.alias,
    value: getValue(config.name, attributes[config.name], fields),
  }));

  const substituteAttributes = (url) =>
    url.replace(/{([^}]+)}/g, (_, key) => attributes[key]);

  const hasRelationships = relationshipClasses.length > 0;

  const setFilter = () => {
    send({
      type: 'SET_FILTER',
      filter: {
        geometry,
        name: 'Feature Geometry',
      },
    });
  };

  return (
    <Tabs.Root
      className="min-h-0 flex-1 border-l-0 text-sm"
      defaultValue="attributes"
      ref={forwardedRef}
      orientation="vertical"
    >
      <Tabs.List className="min-w-[175px] data-[orientation=vertical]:border-l-0">
        <Tabs.Trigger value="attributes">Attributes</Tabs.Trigger>
        {hasRelationships ? (
          <Tabs.Trigger value="related">Related Records</Tabs.Trigger>
        ) : null}
        <Tabs.Trigger value="links">Links</Tabs.Trigger>
        <Button className={buttonClasses} onClick={() => zoom(geometry)}>
          <Icon name="visibility" className="mr-2" label="zoom to feature" />
          Zoom to feature
        </Button>
        <Button className={buttonClasses} onClick={onBack}>
          <Icon name="arrowLeft" className="mr-2" label="back" />
          Back to results
        </Button>
        {geometry.type === 'polygon' ? (
          <Button className={buttonClasses} onClick={setFilter}>
            <Icon name="search" className="mr-2" label="filter" />
            New search <br /> using feature
          </Button>
        ) : null}
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
      {hasRelationships ? (
        <Tabs.Content className="min-w-0" value="related">
          <RelatedRecords
            relationshipClasses={relationshipClasses}
            attributes={attributes}
          />
        </Tabs.Content>
      ) : null}
      <Tabs.Content value="links">
        <div className="flex h-full flex-col justify-around">
          {links.map(({ text, url }) => (
            <Button
              key={text}
              href={substituteAttributes(url)}
              size="lg"
              external
              onClick={() => logEvent('link-click', { url, text })}
            >
              {text}
            </Button>
          ))}
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}

const ForwardedIdentify = forwardRef(Identify);
export default ForwardedIdentify;

LinkDetectingCell.propTypes = {
  getValue: PropTypes.func.isRequired,
};

Identify.propTypes = {
  attributes: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  geometry: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }).isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onBack: PropTypes.func.isRequired,
  relationshipClasses: PropTypes.array.isRequired,
};
