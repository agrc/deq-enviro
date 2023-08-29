import * as Collapsible from '@radix-ui/react-collapsible';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { fieldNames } from '../../functions/common/config';
import Icon from '../utah-design-system/Icon';
import Table from '../utah-design-system/Table';
import Button from '../utah-design-system/Button';
import { useState } from 'react';
import Identify from './Identify';
import ky from 'ky';
import { getAlias } from '../utils';

export default function ResultTable({
  queryLayerResult,
  onExpandChange,
  expanded,
}) {
  const columns = useMemo(
    () =>
      queryLayerResult[fieldNames.queryLayers.resultGridFields].map(
        (field) => ({
          accessorKey: field,
          header: getAlias(field, queryLayerResult.fields),
        }),
      ),
    [queryLayerResult],
  );
  const [identifyResults, setIdentifyResults] = useState(null);

  const identify = async (oid) => {
    const result = await ky
      .get(`${queryLayerResult[fieldNames.queryLayers.featureService]}/query`, {
        searchParams: {
          f: 'json',
          where: `OBJECTID = ${oid}`,
          outFields: '*',
          returnGeometry: false,
        },
      })
      .json();

    const attributes = result.features[0].attributes;

    setIdentifyResults({
      attributes,
      fields: result.fields,
    });
  };

  columns[0].cell = ({ getValue, row }) => (
    <div className="flex items-center">
      <Button
        className="ml-0 mr-1 px-1.5 invisible group-hover/row:visible"
        size="sm"
        onClick={() => identify(row.original.OBJECTID)}
      >
        <Icon
          name={Icon.Names.moreHorizontal}
          size={Icon.Sizes.xs}
          label="more information"
        />
      </Button>
      {getValue()}
    </div>
  );

  const layerName = queryLayerResult[fieldNames.queryLayers.layerName];

  const rows = useMemo(
    () => queryLayerResult?.features?.map((feature) => feature.attributes),
    [queryLayerResult.features],
  );
  const padding = 'px-2 py-1';
  if (queryLayerResult.error) {
    return (
      <div className={clsx(padding, 'text-error-500')}>
        {layerName} | {queryLayerResult.error}
      </div>
    );
  } else if (rows?.length === 0) {
    return (
      <div className={clsx(padding, 'text-slate-400')}>
        {`${layerName} | No results found`}
      </div>
    );
  }

  return (
    <Collapsible.Root
      key={queryLayerResult[fieldNames.queryLayers.uniqueId]}
      className={clsx(
        'group flex flex-col bg-white w-full',
        expanded && 'absolute bottom-0 top-0',
      )}
      open={expanded}
      onOpenChange={onExpandChange}
    >
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className={clsx(
            padding,
            'group/trigger flex w-full items-center hover:bg-slate-200',
            expanded && 'border-b border-slate-300',
          )}
        >
          <Icon
            className="mr-2"
            name={expanded ? Icon.Names.unfoldLess : Icon.Names.unfoldMore}
            size="xs"
            label="toggle results"
          />
          <span className="group-hover/trigger:underline">{layerName}</span>
          <span className="ml-2">|</span>
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0 text-sm">
            {rows.length.toLocaleString()}
          </span>
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content asChild>
        {identifyResults ? (
          <Identify
            onBack={() => setIdentifyResults(null)}
            attributes={identifyResults.attributes}
            fields={identifyResults.fields}
          />
        ) : (
          <Table
            caption={`${layerName} results`}
            className="min-h-0 flex-1 border-b-0 text-sm"
            columns={columns}
            data={rows}
            initialState={{
              sorting: [{ id: columns[1].accessorKey, desc: false }],
            }}
          />
        )}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

ResultTable.propTypes = {
  queryLayerResult: PropTypes.shape({
    error: PropTypes.node,
    features: PropTypes.array,
    fields: PropTypes.array,
  }).isRequired,
  onExpandChange: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
};
