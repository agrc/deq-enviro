import { fromJSON } from '@arcgis/core/geometry/support/jsonUtils';
import * as Collapsible from '@radix-ui/react-collapsible';
import clsx from 'clsx';
import ky from 'ky';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { fieldConfigs, fieldNames } from '../../functions/common/config';
import useMap from '../contexts/useMap';
import Button from '../utah-design-system/Button';
import Icon from '../utah-design-system/Icon';
import Table from '../utah-design-system/Table';
import { getAlias } from '../utils';
import Identify from './Identify';
import Legend from './Legend';

const padding = 'px-2 py-1';

/**
 * Error
 *
 * @param {Object} props
 * @param {string} props.layerName
 * @param {string | Object} [props.errorMessage]
 */
function Error({ layerName, errorMessage }) {
  return (
    <div className={clsx(padding, 'text-error-500')}>
      {layerName} | {errorMessage}
    </div>
  );
}

/**
 * ResultTable
 *
 * @param {Object} props
 * @param {import('../SearchMachineProvider').QueryLayerResult} props.queryLayerResult
 * @param {(open: boolean) => void} props.onExpandChange
 * @param {boolean} props.expanded
 */
export default function ResultTable({
  queryLayerResult,
  onExpandChange,
  expanded,
}) {
  const { selectedGraphicInfo, setSelectedGraphicInfo } = useMap();

  const identify = useCallback(
    async (oid) => {
      /** @type {import('@arcgis/core/rest/support/FeatureSet').default} */
      const result = await ky
        .get(
          `${queryLayerResult[fieldNames.queryLayers.featureService]}/query`,
          {
            searchParams: {
              f: 'json',
              where: `OBJECTID = ${oid}`,
              outFields: '*',
              returnGeometry: true,
              outSR: 3857,
            },
          },
        )
        .json();

      const attributes = result.features[0].attributes;

      setIdentifyResults({
        attributes,
        fields: result.fields,
        geometry: fromJSON({
          ...result.features[0].geometry,
          type: result.geometryType,
          spatialReference: result.spatialReference,
        }),
      });
    },
    [queryLayerResult],
  );

  useEffect(() => {
    if (
      selectedGraphicInfo?.layerId ===
      queryLayerResult[fieldNames.queryLayers.uniqueId]
    ) {
      identify(selectedGraphicInfo.oid);
    }
  }, [selectedGraphicInfo, queryLayerResult, identify]);

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

  columns[0].cell = ({ getValue, row }) => (
    <div className="flex items-center">
      <Button
        className="invisible ml-0 mr-1 px-1.5 group-hover/row:visible"
        size="sm"
        onClick={() => {
          setSelectedGraphicInfo({
            oid: row.original.OBJECTID,
            layerId: queryLayerResult[fieldNames.queryLayers.uniqueId],
          });
        }}
      >
        <Icon name="moreHorizontal" size="xs" label="more information" />
      </Button>
      {getValue()}
    </div>
  );

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

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <Error layerName={layerName} errorMessage={error.message} />
      )}
    >
      <Collapsible.Root
        key={queryLayerResult[fieldNames.queryLayers.uniqueId]}
        className={clsx(
          'group flex w-full flex-col bg-white',
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
              name={expanded ? 'unfoldLess' : 'unfoldMore'}
              size="xs"
              label="toggle results"
            />
            <Legend featureLayer={queryLayerResult.featureLayer} />
            <span className="ml-2 flex h-full items-center justify-center group-hover/trigger:underline">
              {layerName}
            </span>
            <span className="ml-1 flex h-full items-center justify-center rounded-full bg-slate-100 px-2 py-0 text-sm">
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
              links={getLinks()}
              geometry={identifyResults.geometry}
            />
          ) : (
            <Table
              caption={`${layerName} results`}
              className="min-h-0 flex-1 border-b-0 text-sm"
              columns={columns}
              data={rows}
              // @ts-ignore
              initialState={{
                sorting: [{ id: columns[0].accessorKey, desc: false }],
              }}
            />
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </ErrorBoundary>
  );
}
