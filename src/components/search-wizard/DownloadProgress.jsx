import PropTypes from 'prop-types';
import { useRef } from 'react';
import { fieldNames } from '../../../functions/common/config';
import Icon from '../../utah-design-system/Icon';
import ResultStatusIcons from './ResultStatusIcons';
import Tag from '../Tag';

export default function DownloadProgress({ layers, results }) {
  const anchorTagRefs = useRef(new Map());

  return (
    <>
      <h3>Download Results</h3>
      <ul>
        {layers.map((searchLayer) => {
          const tableName = searchLayer[fieldNames.queryLayers.tableName];
          const resultConfig = results.find(
            (result) => result.tableName === tableName,
          );
          const layerName = searchLayer[fieldNames.queryLayers.layerName];

          return (
            <li key={tableName} className="mb-1">
              <div className="flex items-center justify-start">
                <ResultStatusIcons
                  resultConfig={resultConfig}
                  layerName={layerName}
                />
                <span className="leading-5">
                  {layerName}
                  {resultConfig?.features ? (
                    <Tag>{resultConfig.features.length.toLocaleString()}</Tag>
                  ) : null}
                </span>
              </div>
              {resultConfig?.url ? (
                <a
                  ref={(node) => {
                    if (node) {
                      anchorTagRefs.current.set(tableName, node);
                    } else {
                      anchorTagRefs.current.delete(tableName);
                    }
                  }}
                  href={resultConfig.url}
                  download={resultConfig.url.substring(
                    resultConfig.url.lastIndexOf('/') + 1,
                  )}
                  className="flex items-center justify-center rounded-md border-2 border-success-500 p-1 font-bold text-success-500"
                >
                  <Icon className="mr-2" name="arrowDown" label="download" />{' '}
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
    </>
  );
}

DownloadProgress.propTypes = {
  layers: PropTypes.arrayOf(PropTypes.object).isRequired,
  results: PropTypes.arrayOf(PropTypes.object),
};
