import { useFirebaseAnalytics } from '@ugrc/utah-design-system';
import { ArrowDownIcon, CircleAlertIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { BulletList } from 'react-content-loader';
import { fieldNames } from '../../../functions/common/config';
import ResultStatusIcons from './ResultStatusIcons';
import useFirestoreDocData from './useFirestoreDocData';

/**
 * Displays download progress for layers
 *
 * @returns {JSX.Element}
 */
export default function DownloadProgress({ layers, id, error }) {
  const {
    loading,
    data,
    error: docError,
  } = useFirestoreDocData('jobs', `${id}-results`);

  if (loading || data === undefined) {
    return <BulletList className="h-80 w-full p-2" />;
  }

  const { status: jobStatus, layerResults, error: jobError } = data;
  const url = `${import.meta.env.VITE_DOWNLOAD_URL}/download/${id}/data.zip`; // this helps the browser name the file correctly

  return (
    <DownloadProgressInner
      layers={layers}
      layerResults={layerResults}
      url={jobStatus === 'complete' ? url : null}
      error={error || docError || jobError}
    />
  );
}

/**
 * Inner component showing download progress details
 *
 * @returns {JSX.Element}
 */
export function DownloadProgressInner({ layers, layerResults, error, url }) {
  const logEvent = useFirebaseAnalytics();

  return (
    <>
      <h3>Download Results</h3>
      <ul>
        {layers.map((searchLayer) => {
          const tableName = searchLayer[fieldNames.queryLayers.tableName];
          const layerName = searchLayer[fieldNames.queryLayers.layerName];
          const jobLayer = layerResults[tableName];
          const finished = jobLayer?.processed || jobLayer?.error;

          return (
            <li
              key={tableName}
              className="mb-1 flex items-center justify-start"
            >
              <ResultStatusIcons
                resultConfig={finished ? jobLayer : null}
                layerName={layerName}
              />
              <span className="leading-5">{layerName}</span>
            </li>
          );
        })}
      </ul>
      {url ? (
        <a
          href={url}
          download="data.zip"
          className="mt-4 flex items-center justify-center rounded-md border-2 border-success-500 p-1 font-bold text-success-500"
          onClick={() => logEvent('download-zip-file', { url })}
        >
          <ArrowDownIcon className="mr-2" aria-hidden="true" /> Download ZIP
          File
        </a>
      ) : error ? (
        <p className="mt-4 flex align-middle text-error-500">
          <CircleAlertIcon className="mr-1 size-6" />
          There was an error downloading the data: {error}
        </p>
      ) : (
        <>
          <p className="mt-4">
            This can take up to several minutes for larger datasets.
          </p>
        </>
      )}
    </>
  );
}

DownloadProgressInner.propTypes = {
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      'Table Name': PropTypes.string.isRequired,
      'Layer Name': PropTypes.string.isRequired,
    }),
  ).isRequired,
  layerResults: PropTypes.objectOf(
    PropTypes.shape({
      processed: PropTypes.bool,
      error: PropTypes.string,
    }),
  ),
  error: PropTypes.string,
  url: PropTypes.string,
};

DownloadProgress.propTypes = {
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      'Table Name': PropTypes.string.isRequired,
      'Layer Name': PropTypes.string.isRequired,
    }),
  ).isRequired,
  id: PropTypes.string.isRequired,
  error: PropTypes.instanceOf(Error),
};
