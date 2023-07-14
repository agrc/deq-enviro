import * as Collapsible from '@radix-ui/react-collapsible';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { fieldNames } from '../../functions/common/config';
import Icon from '../utah-design-system/Icon';
import Table from '../utah-design-system/Table';

export default function ResultTable({
  queryLayerResult,
  onExpandChange,
  expanded,
}) {
  const columns = queryLayerResult[fieldNames.queryLayers.resultGridFields].map(
    (field) => ({
      accessorKey: field,
      Header: field,
    })
  );

  columns.push({
    accessorKey: 'OBJECTID',
    Header: 'OBJECTID',
  });

  const layerName = queryLayerResult[fieldNames.queryLayers.layerName];

  const padding = 'px-2 py-1';
  if (queryLayerResult.error) {
    return (
      <div className={clsx(padding, 'text-error-500')}>
        {`${layerName} | ${queryLayerResult.error}`}
      </div>
    );
  } else if (queryLayerResult.features?.length === 0) {
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
        'group flex flex-col bg-white',
        expanded && 'absolute bottom-0 top-0'
      )}
      open={expanded}
      onOpenChange={onExpandChange}
    >
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className={clsx(
            padding,
            'group/trigger flex w-full items-center hover:bg-slate-100',
            expanded && 'border-b border-slate-300'
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
            {queryLayerResult.features.length.toLocaleString()}
          </span>
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content asChild>
        <Table
          caption={`${layerName} results`}
          className="flex-1 border-b-0"
          columns={columns}
          data={queryLayerResult.features.map((feature) => feature.attributes)}
          initialState={{ columnVisibility: { OBJECTID: false } }}
        />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

ResultTable.propTypes = {
  queryLayerResult: PropTypes.shape({
    error: PropTypes.string,
    features: PropTypes.array,
  }).isRequired,
  onExpandChange: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
};
