import { useMutation } from '@tanstack/react-query';
import ky from 'ky';
import { Suspense, lazy, useEffect, useState } from 'react';
import { useRemoteConfigString } from 'reactfire';
import { fieldNames } from '../../../functions/common/config.js';
import { schemas } from '../../../functions/common/validation.js';
import { useSearchMachine } from '../../SearchMachineProvider.jsx';
import Button from '../../utah-design-system/Button.jsx';
import Spinner from '../../utah-design-system/Spinner.jsx';
import SelectMapData from './SelectMapData.jsx';

const AdvancedFilter = lazy(() => import('./AdvancedFilter.jsx'));
const Download = lazy(() => import('./Download.jsx'));
const DownloadProgress = lazy(() => import('./DownloadProgress.jsx'));
const Progress = lazy(() => import('./SearchProgress.jsx'));

async function generateZip(layer, format, send) {
  const layerUrl = layer.featureService;
  const parentUrl = layerUrl.substring(0, layerUrl.lastIndexOf('/'));
  const layerIndex = layerUrl.substring(layerUrl.lastIndexOf('/') + 1);
  const params = new URLSearchParams({
    layers: layerIndex,
    layerQueries: JSON.stringify({
      [layerIndex]: { where: `OBJECTID IN (${layer.objectIds.join(',')})` },
    }),
    syncModel: 'none',
    dataFormat: format,
    f: 'json',
  });

  let response;
  try {
    response = await ky
      .post(`${parentUrl}/createReplica`, {
        body: params,
        timeout: 120 * 60 * 1000,
      })
      .json();
  } catch (error) {
    response = { error };
  }

  if (response.error) {
    send('RESULT', {
      result: {
        uniqueId: layer.uniqueId,
        error: response.error.message,
      },
    });
  } else {
    send('RESULT', {
      result: {
        uniqueId: layer.uniqueId,
        url: response.responseUrl,
      },
    });
  }
}

export default function SearchWizard() {
  const [state, send] = useSearchMachine();
  const [queryLayers, setQueryLayers] = useState([]);
  // todo - use logEvent from 'firebase/analytics' to log which layers are selected

  const queryLayersConfig = useRemoteConfigString('queryLayers');
  useEffect(() => {
    if (queryLayersConfig.status === 'success') {
      console.log('validating query layer configs');
      const validatedQueryLayers = JSON.parse(queryLayersConfig.data).filter(
        (config) => {
          try {
            schemas.queryLayers.validateSync(config);
            return true;
          } catch (error) {
            console.warn(
              `Invalid Query Layer config for ${
                config[fieldNames.queryLayers.layerName]
              }: \n${error.message} \n${JSON.stringify(config, null, 2)})}`
            );
            return false;
          }
        }
      );
      setQueryLayers(validatedQueryLayers);
    }
  }, [queryLayersConfig]);

  const downloadMutation = useMutation({
    mutationFn: async ({ layers, format }) => {
      send('DOWNLOADING');
      return await Promise.all(
        layers.map((layer) => generateZip(layer, format, send))
      );
    },
  });

  // this is to prevent the advanced filter code from loading until the user clicks on it
  const [advancedFilterTouched, setAdvancedFilterTouched] = useState(false);
  useEffect(() => {
    if (!advancedFilterTouched && state.matches('advanced')) {
      setAdvancedFilterTouched(true);
    }
  }, [advancedFilterTouched, state, state.value]);

  if (queryLayersConfig.status === 'loading' || !state.context.searchLayers) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-2">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <Spinner className="h-10 w-10" size={Spinner.Sizes.custom} />
            </div>
          }
        >
          {state.matches('selectLayers') ? (
            <SelectMapData queryLayers={queryLayers} />
          ) : null}
          {state.matches('searching') || state.matches('result') ? (
            <Progress
              searchLayers={state.context.searchLayers}
              results={state.context.resultLayers}
              filterName={state.context.filter.name}
            />
          ) : null}
          {advancedFilterTouched && (
            <AdvancedFilter visible={state.matches('advanced')} />
          )}
          {state.matches('error') ? (
            <p>{JSON.stringify(state.context.error, null, 2)}</p>
          ) : null}
          {state.matches('download') ? (
            <Download
              searchResultLayers={state.context.resultLayers}
              mutation={downloadMutation}
              selectedLayers={state.context.selectedDownloadLayers}
              setSelectedLayers={(newIds) =>
                send('SET_SELECTED_LAYERS', { selectedLayers: newIds })
              }
              format={state.context.downloadFormat}
              setFormat={(newFormat) =>
                send('SET_FORMAT', { format: newFormat })
              }
            />
          ) : null}
          {state.matches('downloading') ? (
            <DownloadProgress
              layers={queryLayers.filter((layer) =>
                state.context.selectedDownloadLayers.includes(
                  layer[fieldNames.queryLayers.uniqueId]
                )
              )}
              results={state.context.downloadResultLayers}
            />
          ) : null}
        </Suspense>
      </div>

      <div className="space-y-2 justify-self-end border-t border-t-slate-300 p-2">
        {state.matches('selectLayers') ||
        state.matches('searching') ||
        state.matches('advanced') ? (
          <>
            <Button
              appearance={Button.Appearances.solid}
              color={Button.Colors.primary}
              className="w-full"
              size={Button.Sizes.xl}
              busy={state.matches('searching')}
              disabled={
                state.context.searchLayers.length === 0 ||
                (!state.context.filter.geometry && !state.context.filter.where)
              }
              onClick={() => send('SEARCH')}
            >
              Search{' '}
              {state.context.searchLayers.length
                ? `${state.context.searchLayers.length} Layer${
                    state.context.searchLayers.length > 1 ? 's' : ''
                  }`
                : null}
            </Button>
          </>
        ) : null}
        {state.matches('selectLayers') ? (
          <Button
            appearance={Button.Appearances.outlined}
            color={Button.Colors.primary}
            className="w-full"
            disabled={state.context.searchLayers.length === 0}
            size={Button.Sizes.xl}
            onClick={() => send('ADVANCED')}
          >
            Open Advanced Filter
          </Button>
        ) : null}
        {state.matches('advanced') ? (
          <Button
            appearance={Button.Appearances.outlined}
            color={Button.Colors.primary}
            className="w-full"
            size={Button.Sizes.xl}
            onClick={() => send('QUERY_LAYERS')}
          >
            Back
          </Button>
        ) : null}
        {state.matches('result') ? (
          <>
            <Button
              color={Button.Colors.primary}
              appearance={Button.Appearances.solid}
              className="w-full"
              size={Button.Sizes.xl}
              onClick={() => send('DOWNLOAD')}
            >
              Download
            </Button>
            <Button
              color={Button.Colors.primary}
              className="w-full"
              size={Button.Sizes.xl}
              onClick={() => send('QUERY_LAYERS')}
            >
              Back
            </Button>
          </>
        ) : null}
        {state.matches('download') ? (
          <Button
            appearance={Button.Appearances.solid}
            color={Button.Colors.primary}
            className="w-full"
            size={Button.Sizes.xl}
            onClick={() =>
              downloadMutation.mutate(
                {
                  layers: state.context.resultLayers
                    .filter((result) =>
                      state.context.selectedDownloadLayers.includes(
                        result[fieldNames.queryLayers.uniqueId]
                      )
                    )
                    .map((result) => ({
                      uniqueId: result[fieldNames.queryLayers.uniqueId],
                      featureService:
                        result[fieldNames.queryLayers.featureService],
                      name: result[fieldNames.queryLayers.layerName],
                      objectIds: result.features.map(
                        (feature) => feature.attributes.OBJECTID
                      ),
                    })),
                  format: state.context.downloadFormat,
                },
                {
                  onError: console.error,
                }
              )
            }
            busy={downloadMutation.isLoading}
          >
            Generate Downloads
          </Button>
        ) : null}
        {state.matches('download') || state.matches('downloading') ? (
          <Button
            color={Button.Colors.primary}
            className="w-full"
            size={Button.Sizes.xl}
            onClick={() => send('BACK')}
          >
            Back
          </Button>
        ) : null}
        <Button
          color={Button.Colors.none}
          className="w-full"
          size={Button.Sizes.xl}
          onClick={() => send('CLEAR')}
          disabled={state.matches('searching')}
        >
          {state.matches('selectLayers') ? 'Clear' : 'Start New Search'}
        </Button>
      </div>
    </div>
  );
}
