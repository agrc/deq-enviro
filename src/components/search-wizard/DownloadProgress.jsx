import { doc } from 'firebase/firestore';
import { BulletList } from 'react-content-loader';
import { useAnalytics, useFirestore, useFirestoreDocData } from 'reactfire';
import { fieldNames } from '../../../functions/common/config';
import Icon from '../../utah-design-system/Icon';
import ResultStatusIcons from './ResultStatusIcons';
import { logEvent } from 'firebase/analytics';

/**
 * @param {Object} props
 * @param {import('../../../functions/common/config').QueryLayerConfig[]} props.layers
 * @param {string} props.id
 * @param {Error} [props.error]
 * @returns {JSX.Element}
 */
export default function DownloadProgress({ layers, id, error }) {
  const firestore = useFirestore();

  const ref = doc(firestore, 'jobs', `${id}-results`);

  const { status: documentStatus, data } = useFirestoreDocData(ref);

  if (documentStatus === 'loading' || data === undefined) {
    return <BulletList className="h-80 w-full p-2" />;
  }

  const { status: jobStatus, layerResults, error: jobError } = data;
  const url = `${import.meta.env.VITE_DOWNLOAD_URL}/download/${id}/data.zip`; // this helps the browser name the file correctly

  return (
    <DownloadProgressInner
      layers={layers}
      layerResults={layerResults}
      url={jobStatus === 'complete' ? url : null}
      error={error || jobError}
    />
  );
}

/**
 * @param {Object} props
 * @param {import('../../../functions/common/config').QueryLayerConfig[]} props.layers
 * @param {Object} props.layerResults
 * @param {string} props.error
 * @param {string} [props.url]
 * @returns {JSX.Element}
 */
export function DownloadProgressInner({ layers, layerResults, error, url }) {
  const analytics = useAnalytics();

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
          onClick={() => logEvent(analytics, 'download_zip_file', { url })}
        >
          <Icon className="mr-2" name="arrowDown" label="download" /> Download
          ZIP File
        </a>
      ) : error ? (
        <p className="mt-4 flex align-middle text-error-500">
          <Icon
            name="error"
            className="mr-1"
            label="error message"
            size="3xl"
          />
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
