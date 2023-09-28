import { fieldNames } from '../../../functions/common/config';
import { getLayerByUniqueId } from '../../utils';
import ResultStatusIcons from './ResultStatusIcons';

/**
 * @param {object} props
 * @param {string[]} props.searchLayerIds
 * @param {import('../../../functions/common/config').QueryLayerConfig[]} props.queryLayers
 * @param {object[]} props.results
 * @param {string} props.filterName
 * @returns {JSX.Element}
 */
export default function SearchProgress({
  searchLayerIds,
  queryLayers,
  results,
  filterName,
}) {
  return (
    <>
      <h3>Search Results</h3>
      <ul>
        {searchLayerIds.map((uniqueId) => {
          const config = getLayerByUniqueId(uniqueId, queryLayers);
          const resultConfig = results.find(
            (result) => result[fieldNames.queryLayers.uniqueId] === uniqueId,
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
    </>
  );
}
