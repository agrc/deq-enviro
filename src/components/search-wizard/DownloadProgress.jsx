import { fieldNames } from '../../../functions/common/config';
import Icon from '../../utah-design-system/Icon';
import Spinner from '../../utah-design-system/Spinner';

/**
 * @param {Object} props
 * @param {import('../../../functions/common/config').QueryLayerConfig[]} props.layers
 * @param {string} props.url
 * @param {Error} [props.error]
 * @returns {JSX.Element}
 */
export default function DownloadProgress({ layers, url, error }) {
  return (
    <>
      <h3>Download Results</h3>
      <ul>
        {layers.map((searchLayer) => {
          const tableName = searchLayer[fieldNames.queryLayers.tableName];
          const layerName = searchLayer[fieldNames.queryLayers.layerName];

          return (
            <li key={tableName} className="mb-1">
              <div className="flex items-center justify-start">
                <span className="leading-5">{layerName}</span>
              </div>
            </li>
          );
        })}
      </ul>
      {url ? (
        <a
          href={url}
          download="data.gdb.zip"
          className="mt-4 flex items-center justify-center rounded-md border-2 border-success-500 p-1 font-bold text-success-500"
        >
          <Icon className="mr-2" name="arrowDown" label="download" /> download
        </a>
      ) : error ? (
        <p className="mt-4 flex align-middle text-error-500">
          <Icon
            name="error"
            className="mr-1"
            label="error message"
            size="3xl"
          />
          There was an error downloading the data: {error.message}
        </p>
      ) : (
        <>
          <p className="mt-4">
            This can take up to several minutes for larger datasets.
          </p>
          <div className="flex items-center justify-center">
            <Spinner
              ariaLabel="downloading activity indicator"
              size="custom"
              className="h-14 w-14"
            />
          </div>
        </>
      )}
    </>
  );
}
