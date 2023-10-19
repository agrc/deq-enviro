import { forwardRef } from 'react';
import useMap from '../contexts/useMap';
import Button from '../utah-design-system/Button';
import Icon from '../utah-design-system/Icon';
import Link from '../utah-design-system/Link';
import SimpleTable from '../utah-design-system/SimpleTable';
import * as Tabs from '../utah-design-system/Tabs';
import { getAlias } from '../utils';
import RelatedRecords from './RelatedRecords';

const buttonClasses = 'border-none px-2 my-1';

const urlRegex = /^https?:\/\/\S*$/;

/**
 * @param {Object} props
 * @param {() => ?(string | number)} props.getValue
 * @returns {?(JSX.Element | string | number)}
 */
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

  // TODO: handle formatting dates?

  return value;
}

/**
 * @param {Object} props
 * @param {Record<string, string | number | boolean>} props.attributes
 * @param {Object} props.fields
 * @param {import('@arcgis/core/geometry/Geometry').default} props.geometry
 * @param {{ text: string; url: string }[]} props.links
 * @param {() => void} props.onBack
 * @param {import('../../functions/common/config').RelationshipClassConfig[]} props.relationshipClasses
 * @param {import('react').Ref<any>} forwardedRef
 * @returns {JSX.Element}
 */
function Identify(
  { attributes, fields, geometry, links, onBack, relationshipClasses },
  forwardedRef,
) {
  const { zoom } = useMap();

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

  const data = Object.entries(attributes).map(([field, value]) => ({
    field: getAlias(field, fields),
    value,
  }));

  const substituteAttributes = (url) =>
    url.replace(/{([^}]+)}/g, (_, key) => attributes[key]);

  const hasRelationships = relationshipClasses.length > 0;

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
          <Icon name="search" className="mr-2" label="zoom to feature" /> Zoom
          to feature
        </Button>
        <Button className={buttonClasses} onClick={onBack}>
          <Icon name="arrowLeft" className="mr-2" label="back" />
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
