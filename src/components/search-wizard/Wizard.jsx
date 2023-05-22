import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import { useFunctions, useRemoteConfigString } from 'reactfire';
import { fieldNames, schemas } from '../../../functions/common/config.js';
import { useSearchMachine } from '../../SearchMachineProvider.jsx';
import Button from '../../utah-design-system/Button.jsx';
import AdvancedFilter from './AdvancedFilter.jsx';
import Download from './Download.jsx';
import Progress from './Progress.jsx';
import SelectMapData from './SelectMapData.jsx';

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

  const generateZip = httpsCallable(useFunctions(), 'generate');
  const generateZipMutation = useMutation({
    mutationFn: async (data) => {
      return await generateZip(data);
    },
  });

  if (queryLayersConfig.status === 'loading' || !state.context.searchLayers) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      {state.matches('selectLayers') ? (
        <SelectMapData queryLayers={queryLayers} />
      ) : null}
      {state.matches('searching') || state.matches('result') ? (
        <Progress
          searchLayers={state.context.searchLayers}
          results={state.context.resultLayers}
        />
      ) : null}
      {state.matches('advanced') ? <AdvancedFilter /> : null}
      {state.matches('error') ? (
        <p>{JSON.stringify(state.context.error, null, 2)}</p>
      ) : null}
      {state.matches('download') ? (
        <Download
          searchResultLayers={state.context.resultLayers}
          mutation={generateZipMutation}
        />
      ) : null}
      <div className="space-y-2 justify-self-end border-t border-t-slate-300 p-2">
        {state.matches('selectLayers') || state.matches('searching') ? (
          <Button
            appearance={Button.Appearances.solid}
            color={Button.Colors.primary}
            className="w-full"
            size={Button.Sizes.xl}
            busy={state.matches('searching')}
            disabled={state.context.searchLayers.length === 0}
            onClick={() => send('SEARCH')}
          >
            Search{' '}
            {state.context.searchLayers.length
              ? `${state.context.searchLayers.length} Layer${
                  state.context.searchLayers.length > 1 ? 's' : ''
                }`
              : null}
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
          <>
            <Button
              color={Button.Colors.primary}
              className="w-full"
              size={Button.Sizes.xl}
              onClick={() => send('BACK')}
            >
              Back
            </Button>
          </>
        ) : null}
        <Button
          color={Button.Colors.accent}
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
