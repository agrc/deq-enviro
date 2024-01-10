import { fieldNames } from '../../../functions/common/config';
import { getConfigByTableName } from '../../utils';
import Tag from '../Tag';
import ResultStatusIcons from './ResultStatusIcons';

/**
 * @param {object} props
 * @param {string[]} props.searchLayerTableNames
 * @param {import('../../../functions/common/config').QueryLayerConfig[]} props.queryLayers
 * @param {Record<
 *   string,
 *   import('../../contexts/SearchMachineProvider').QueryLayerResult
 * >} props.results
 * @param {string} props.filterName
 * @returns {JSX.Element}
 */
export default function SearchProgress({
  searchLayerTableNames,
  queryLayers,
  results,
  filterName,
}) {
  return (
    <>
      <h3>Search Results</h3>
      <ul>
        {searchLayerTableNames.map((tableName) => {
          const config = getConfigByTableName(tableName, queryLayers);
          const resultConfig = results && results[tableName];
          const layerName = config[fieldNames.queryLayers.layerName];

          return (
            <li
              key={tableName}
              className="mb-1 flex items-center justify-start"
            >
              <ResultStatusIcons
                resultConfig={resultConfig}
                layerName={layerName}
              />
              <span className="leading-5">
                <div>
                  {layerName}
                  {resultConfig?.features ? (
                    <Tag>{resultConfig.features.length.toLocaleString()}</Tag>
                  ) : null}
                </div>
                {resultConfig?.error ? (
                  <div className="text-sm text-error-500">
                    {resultConfig.error}
                  </div>
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
