import PropTypes from 'prop-types';
import { useRef } from 'react';
import { fieldNames } from '../../../functions/common/config';
import Icon from '../../utah-design-system/Icon';
import ResultStatusIcons from './ResultStatusIcons';

export default function DownloadProgress({ layers, results }) {
  const anchorTagRefs = useRef(new Map());

  return (
    <div className="flex-1 p-2">
      <h3>Download Results</h3>
      <ul>
        {layers.map((searchLayer) => {
          const uniqueId = searchLayer[fieldNames.queryLayers.uniqueId];
          const resultConfig = results.find(
            (result) => result.uniqueId === uniqueId
          );
          const layerName = searchLayer[fieldNames.queryLayers.layerName];

          return (
            <li key={uniqueId} className="mb-1">
              <div className="flex items-center justify-start">
                <ResultStatusIcons
                  resultConfig={resultConfig}
                  layerName={layerName}
                />
                <span className="leading-5">
                  {layerName}
                  {resultConfig?.features ? (
                    <span className="ml-1 rounded-full bg-slate-100 px-2 py-0 text-sm">
                      {resultConfig.features.length.toLocaleString()}
                    </span>
                  ) : null}
                </span>
              </div>
              {resultConfig?.url ? (
                <a
                  ref={(node) => {
                    if (node) {
                      anchorTagRefs.current.set(uniqueId, node);
                    } else {
                      anchorTagRefs.current.delete(uniqueId);
                    }
                  }}
                  href={resultConfig.url}
                  download={resultConfig.url.substring(
                    resultConfig.url.lastIndexOf('/') + 1
                  )}
                  className="flex items-center justify-center rounded-md border-2 border-emerald-500 p-1 font-bold text-emerald-500"
                >
                  <Icon
                    className="mr-2"
                    name={Icon.Names.arrowDown}
                    label="download"
                  />{' '}
                  download
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="mt-4">
        This can take up to several minutes for larger datasets.
      </p>
    </div>
  );
}

DownloadProgress.propTypes = {
  layers: PropTypes.arrayOf(PropTypes.object).isRequired,
  results: PropTypes.arrayOf(PropTypes.object),
};
