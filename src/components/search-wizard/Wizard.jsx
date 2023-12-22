import { useMutation } from '@tanstack/react-query';
import ky from 'ky';
import { Suspense, lazy, useEffect, useState } from 'react';
import { fieldNames } from '../../../functions/common/config.js';
import { schemas } from '../../../functions/common/validation.js';
import { useSearchMachine } from '../../contexts/SearchMachineProvider.jsx';
import Button from '../../utah-design-system/Button.jsx';
import Spinner from '../../utah-design-system/Spinner.jsx';
import SelectMapData from './SelectMapData.jsx';
import { useRemoteConfigValues } from '../../contexts/RemoteConfigProvider.jsx';
import { getConfigByTableName, getRelationships } from '../../utils.js';

/**
 * @typedef {{
 *   tableName: string;
 *   url: string;
 *   primary: string;
 *   foreign: string;
 *   name: string;
 * }} DownloadRelationship
 */

/**
 * @typedef {{
 *   tableName: string;
 *   url: string;
 *   objectIds: number[];
 *   relationships: DownloadRelationship[];
 * }} DownloadLayer
 */

const AdvancedFilter = lazy(() => import('./AdvancedFilter.jsx'));
const Download = lazy(() => import('./Download.jsx'));
const DownloadProgress = lazy(() => import('./DownloadProgress.jsx'));
const Progress = lazy(() => import('./SearchProgress.jsx'));

export default function SearchWizard() {
  const [state, send] = useSearchMachine();
  const [datasetConfigs, setDatasetConfigs] = useState({
    queryLayers: [],
    relatedTables: [],
  });
  // todo - use logEvent from 'firebase/analytics' to log which layers are selected

  const { relationshipClasses: allRelationshipClasses } =
    useRemoteConfigValues();

  const { queryLayers: queryLayerConfigs, relatedTables: relatedTableConfigs } =
    useRemoteConfigValues();
  useEffect(() => {
    if (!queryLayerConfigs || !relatedTableConfigs) {
      return;
    }

    console.log('validating dataset configs');

    const validatedQueryLayers = queryLayerConfigs.filter((config) => {
      try {
        schemas.queryLayers.validateSync(config);
        return true;
      } catch (error) {
        console.warn(
          `Invalid Query Layer config for ${
            config[fieldNames.queryLayers.layerName]
          }: \n${error.message} \n${JSON.stringify(config, null, 2)})}`,
        );
        return false;
      }
    });

    const validatedRelatedTables = relatedTableConfigs.filter((config) => {
      try {
        schemas.relatedTables.validateSync(config);
        return true;
      } catch (error) {
        console.warn(
          `Invalid Related Table config for ${
            config[fieldNames.relatedTable.tableName]
          }: \n${error.message} \n${JSON.stringify(config, null, 2)})}`,
        );
        return false;
      }
    });

    setDatasetConfigs({
      queryLayers: validatedQueryLayers,
      relatedTables: validatedRelatedTables,
    });
  }, [queryLayerConfigs, relatedTableConfigs]);

  const downloadMutation = useMutation({
    /**
     * @param {{
     *   layers: DownloadLayer[];
     *   format: string;
     * }} params
     */
    mutationFn: async ({ layers, format }) => {
      send('ERROR', { message: null });

      /** @type {{ success: boolean; error?: string; id?: string }} */
      let result;
      // the dev server can be very slow...
      const timeoutSeconds = import.meta.env.DEV ? 120 : 30;
      try {
        result = await ky
          .post(`${import.meta.env.VITE_DOWNLOAD_URL}/create_job`, {
            json: {
              layers,
              format,
            },
            timeout: 1000 * timeoutSeconds,
          })
          .json();
      } catch (error) {
        console.error(error);
        send('ERROR', { message: error.message });

        return;
      }

      if (result.success) {
        send('DOWNLOADING', {
          id: result.id,
        });
      } else {
        send('ERROR', { message: result.error });
      }
    },
  });

  // this is to prevent the advanced filter code from loading until the user clicks on it
  const [advancedFilterTouched, setAdvancedFilterTouched] = useState(false);
  useEffect(() => {
    if (!advancedFilterTouched && state.matches('advanced')) {
      setAdvancedFilterTouched(true);
    }
  }, [advancedFilterTouched, state, state.value]);

  if (
    queryLayerConfigs.status === 'loading' ||
    !state.context.searchLayerTableNames
  ) {
    return null;
  }

  return (
    <div className="md:w-80">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-2">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <Spinner
                  className="h-10 w-10"
                  size="custom"
                  ariaLabel="loading module"
                />
              </div>
            }
          >
            {state.matches('selectLayers') ? (
              <SelectMapData queryLayers={datasetConfigs.queryLayers} />
            ) : null}
            {state.matches('searching') || state.matches('result') ? (
              <Progress
                searchLayerTableNames={state.context.searchLayerTableNames}
                queryLayers={datasetConfigs.queryLayers}
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
                selectedLayers={state.context.selectedDownloadLayers}
                setSelectedLayers={(newIds) =>
                  send('SET_SELECTED_LAYERS', { selectedLayers: newIds })
                }
                format={state.context.downloadFormat}
                setFormat={(newFormat) =>
                  send('SET_FORMAT', { format: newFormat })
                }
                error={state.context.error}
              />
            ) : null}
            {state.matches('downloading') ? (
              <DownloadProgress
                layers={datasetConfigs.queryLayers.filter((layer) =>
                  state.context.selectedDownloadLayers.includes(
                    layer[fieldNames.queryLayers.tableName],
                  ),
                )}
                error={downloadMutation.error}
                id={state.context.downloadResultId}
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
                appearance="solid"
                color="primary"
                className="w-full"
                size="xl"
                busy={state.matches('searching')}
                disabled={
                  state.context.searchLayerTableNames.length === 0 ||
                  (!state.context.filter.geometry &&
                    !state.context.filter.attribute?.values?.length)
                }
                onClick={() => send('SEARCH')}
              >
                Search{' '}
                {state.context.searchLayerTableNames.length
                  ? `${state.context.searchLayerTableNames.length} Layer${
                      state.context.searchLayerTableNames.length > 1 ? 's' : ''
                    }`
                  : null}
              </Button>
            </>
          ) : null}
          {state.matches('selectLayers') ? (
            <Button
              appearance="outlined"
              color="primary"
              className="w-full"
              disabled={state.context.searchLayerTableNames.length === 0}
              size="xl"
              onClick={() => send('ADVANCED')}
            >
              Open Advanced Filter
            </Button>
          ) : null}
          {state.matches('advanced') ? (
            <Button
              appearance="outlined"
              color="primary"
              className="w-full"
              size="xl"
              onClick={() => send('QUERY_LAYERS')}
            >
              Back
            </Button>
          ) : null}
          {state.matches('result') ? (
            <>
              <Button
                color="primary"
                appearance="solid"
                className="w-full"
                size="xl"
                onClick={() => send('DOWNLOAD')}
              >
                Download
              </Button>
              <Button
                color="primary"
                className="w-full"
                size="xl"
                onClick={() => send('QUERY_LAYERS')}
              >
                Back
              </Button>
            </>
          ) : null}
          {state.matches('download') ? (
            <Button
              appearance="solid"
              color="primary"
              className="w-full"
              disabled={state.context.selectedDownloadLayers.length === 0}
              size="xl"
              onClick={() =>
                downloadMutation.mutate(
                  {
                    layers: state.context.resultLayers
                      .filter((result) =>
                        state.context.selectedDownloadLayers.includes(
                          result[fieldNames.queryLayers.tableName],
                        ),
                      )
                      .map((result) => ({
                        tableName: result[fieldNames.queryLayers.tableName],
                        url: result[fieldNames.queryLayers.featureService],
                        objectIds: result.features.map(
                          (feature) => feature.attributes.OBJECTID,
                        ),
                        relationships: getRelationships(
                          result[fieldNames.queryLayers.tableName],
                          allRelationshipClasses,
                        ).map((relationship) => ({
                          tableName:
                            relationship[
                              fieldNames.relationshipClasses.relatedTableName
                            ],
                          url: getConfigByTableName(
                            relationship[
                              fieldNames.relationshipClasses.relatedTableName
                            ],
                            datasetConfigs.relatedTables,
                          )[fieldNames.queryLayers.featureService],
                          primary:
                            relationship[
                              fieldNames.relationshipClasses.primaryKey
                            ],
                          foreign:
                            relationship[
                              fieldNames.relationshipClasses.foreignKey
                            ],
                          name: `${
                            relationship[
                              fieldNames.relationshipClasses.parentDatasetName
                            ]
                          }_TO_${
                            relationship[
                              fieldNames.relationshipClasses.relatedTableName
                            ]
                          }`,
                        })),
                      })),
                    format: state.context.downloadFormat,
                  },
                  {
                    onError: console.error,
                  },
                )
              }
              busy={downloadMutation.isPending}
            >
              Generate Zip File
            </Button>
          ) : null}
          {state.matches('download') || state.matches('downloading') ? (
            <Button
              color="primary"
              className="w-full"
              size="xl"
              onClick={() => send('BACK')}
            >
              Back
            </Button>
          ) : null}
          <Button
            color="none"
            className="w-full"
            size="xl"
            onClick={() => send('CLEAR')}
            disabled={state.matches('searching')}
          >
            {state.matches('selectLayers') ? 'Clear' : 'Start New Search'}
          </Button>
        </div>
      </div>
    </div>
  );
}
