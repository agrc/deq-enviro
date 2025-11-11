import { fromJSON } from '@arcgis/core/geometry/support/jsonUtils';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useFirebaseAnalytics } from '@ugrc/utah-design-system';
import { clsx } from 'clsx';
import ky from 'ky';
import {
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  EllipsisIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { fieldConfigs, fieldNames } from '../../functions/common/config';
import { useRemoteConfigValues } from '../contexts/RemoteConfigProvider';
import useMap from '../contexts/useMap';
import Button from '../utah-design-system/Button';
import Table from '../utah-design-system/Table';
import { getColumnDefs, getRelationships } from '../utils';
import Identify from './Identify';
import Legend from './Legend';
import Tag from './Tag';

const padding = 'px-2 py-1';

/**
 * Displays an error message for a failed query
 *
 * @returns {JSX.Element}
 */
function Error({ layerName, errorMessage }) {
  return (
    <div className={clsx(padding, 'text-error-500')}>
      {layerName} | {errorMessage}
    </div>
  );
}

Error.propTypes = {
  layerName: PropTypes.string.isRequired,
  errorMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

/**
 * Displays a table of query results with expand/collapse functionality
 *
 * @returns {JSX.Element}
 */
function ResultTable({ queryLayerResult, setExpandedTableName, expanded }) {
  const { selectedGraphicInfo, setSelectedGraphicInfo } = useMap();

  const { relationshipClasses: allRelationshipClasses } =
    useRemoteConfigValues();

  const logEvent = useFirebaseAnalytics();

  const identify = useCallback(
    async (oid) => {
      logEvent('identify-feature', {
        layer_name: queryLayerResult[fieldNames.queryLayers.layerName],
        table_name: queryLayerResult[fieldNames.queryLayers.tableName],
        oid,
      });

      const configIdentifyFields =
        queryLayerResult[fieldNames.queryLayers.identifyFields];

      /** @type {import('@arcgis/core/rest/support/FeatureSet').default} */
      const result = await ky
        .get(
          `${queryLayerResult[fieldNames.queryLayers.featureService]}/query`,
          {
            searchParams: {
              f: 'json',
              where: `OBJECTID = ${oid}`,
              outFields: '*', // don't restrict this since we don't know what the primary key field might be
              returnGeometry: true,
              outSR: 3857,
            },
          },
        )
        .json();

      const attributes = result.features[0].attributes;
      const relationshipClasses = getRelationships(
        queryLayerResult[fieldNames.queryLayers.tableName],
        allRelationshipClasses,
      );
      let fields = result.fields;
      if (configIdentifyFields.length > 0) {
        const lookup = result.fields.reduce((acc, field) => {
          acc[field.name] = field;
          return acc;
        }, {});

        fields = configIdentifyFields.map((config) => {
          return {
            ...lookup[config.name],
            ...config,
          };
        });
      }

      setIdentifyResults({
        attributes,
        fields,
        geometry: fromJSON({
          ...result.features[0].geometry,
          spatialReference: result.spatialReference,
        }),
        relationshipClasses,
      });
    },
    [allRelationshipClasses, logEvent, queryLayerResult],
  );

  useEffect(() => {
    if (
      selectedGraphicInfo?.layerId ===
      queryLayerResult[fieldNames.queryLayers.tableName]
    ) {
      identify(selectedGraphicInfo.oid);
    }
  }, [selectedGraphicInfo, queryLayerResult, identify]);

  const columns = useMemo(() => {
    if (queryLayerResult && !queryLayerResult.error) {
      const newColumns = getColumnDefs(
        queryLayerResult[fieldNames.queryLayers.resultGridFields],
        queryLayerResult.fields,
      );

      // @ts-expect-error - Type checking bypass needed
      newColumns[0].cell = ({ getValue, row }) => (
        <div className="flex items-center">
          <Button
            className="invisible ml-0 mr-1 px-1.5 group-hover/row:visible"
            size="sm"
            onClick={() => {
              setSelectedGraphicInfo({
                oid: row.original.OBJECTID,
                layerId: queryLayerResult[fieldNames.queryLayers.tableName],
              });
            }}
          >
            <EllipsisIcon className="size-4" aria-label="more information" />
          </Button>
          {getValue()}
        </div>
      );

      return newColumns;
    }

    return [];
  }, [queryLayerResult, setSelectedGraphicInfo]);

  const [identifyResults, setIdentifyResults] = useState(null);

  const layerName = queryLayerResult[fieldNames.queryLayers.layerName];

  const rows = useMemo(
    () => queryLayerResult?.features?.map((feature) => feature.attributes),
    [queryLayerResult.features],
  );
  if (queryLayerResult.error) {
    return (
      <Error layerName={layerName} errorMessage={queryLayerResult.error} />
    );
  } else if (rows?.length === 0) {
    return (
      <div className={clsx(padding, 'text-slate-400')}>
        {`${layerName} | No results found`}
      </div>
    );
  }

  const linkProps = [
    'documentSearch',
    'gramaRequest',
    'permitInformation',
    'additionalInformation',
  ];
  const getLinks = () => {
    const links = [];
    linkProps.forEach((prop) => {
      const text = fieldConfigs.queryLayers[prop].name;
      const url = queryLayerResult[text];
      if (url) {
        links.push({
          text,
          url,
        });
      }
    });

    return links;
  };

  const onOpenChange = () => {
    setExpandedTableName(
      expanded ? null : queryLayerResult[fieldNames.queryLayers.tableName],
    );
  };

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <Error layerName={layerName} errorMessage={error.message} />
      )}
    >
      <Collapsible.Root
        key={queryLayerResult[fieldNames.queryLayers.tableName]}
        className={clsx(
          'group flex w-full flex-col bg-white',
          expanded && 'absolute bottom-0 top-0',
        )}
        open={expanded}
        onOpenChange={onOpenChange}
      >
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className={clsx(
              padding,
              'group/trigger flex w-full items-center hover:bg-slate-200',
              expanded && 'border-b border-slate-300',
            )}
            onClick={() =>
              !expanded &&
              logEvent('expand-results-table', {
                layer_name: layerName,
                table_name: queryLayerResult[fieldNames.queryLayers.tableName],
              })
            }
          >
            {expanded ? (
              <ChevronsDownUpIcon
                className="mr-2 size-4"
                label="toggle results"
              />
            ) : (
              <ChevronsUpDownIcon
                className="mr-2 size-4"
                label="toggle results"
              />
            )}
            <Legend featureLayer={queryLayerResult.featureLayer} />
            <span className="ml-2 flex h-full items-center justify-center group-hover/trigger:underline">
              {layerName}
            </span>
            <Tag className="flex h-full items-center justify-center">
              {rows.length.toLocaleString()}
            </Tag>
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content asChild>
          {identifyResults ? (
            <Identify
              onBack={() => setIdentifyResults(null)}
              attributes={identifyResults.attributes}
              fields={identifyResults.fields}
              links={getLinks()}
              geometry={identifyResults.geometry}
              relationshipClasses={identifyResults.relationshipClasses}
            />
          ) : (
            <Table
              caption={`${layerName} results`}
              className="min-h-0 flex-1 border-b-0 text-sm"
              columns={columns}
              data={rows}
              // @ts-expect-error - Type checking bypass needed
              initialState={{
                // @ts-expect-error - Type checking bypass needed
                sorting: [{ id: columns[0].accessorKey, desc: false }],
              }}
            />
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </ErrorBoundary>
  );
}

ResultTable.propTypes = {
  queryLayerResult: PropTypes.shape({
    error: PropTypes.string,
    features: PropTypes.arrayOf(
      PropTypes.shape({
        attributes: PropTypes.object,
      }),
    ),
    fields: PropTypes.array,
    featureLayer: PropTypes.object,
  }).isRequired,
  setExpandedTableName: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
};

// this helps when resizing the results panel with many tables
const MemoizedResultTable = memo(ResultTable);
export default MemoizedResultTable;
