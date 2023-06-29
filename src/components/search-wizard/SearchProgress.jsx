import PropTypes from 'prop-types';
import { fieldNames } from '../../../functions/common/config';
import ResultStatusIcons from './ResultStatusIcons';

export default function SearchProgress({ searchLayers, results, filterName }) {
  return (
    <div className="flex-1 p-2">
      <h3>Search Results</h3>
      <ul>
        {searchLayers.map((config) => {
          const uniqueId = config[fieldNames.queryLayers.uniqueId];
          const resultConfig = results.find(
            (result) => result[fieldNames.queryLayers.uniqueId] === uniqueId
          );
          const layerName = config[fieldNames.queryLayers.layerName];

          return (
            <li key={uniqueId} className="mb-1 flex items-center justify-start">
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
            </li>
          );
        })}
      </ul>
      <h5>Filter</h5>
      <div className="rounded-full bg-slate-200 px-3 py-1">{filterName}</div>
    </div>
  );
}

SearchProgress.propTypes = {
  searchLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
  results: PropTypes.arrayOf(PropTypes.object).isRequired,
  filterName: PropTypes.string.isRequired,
};
