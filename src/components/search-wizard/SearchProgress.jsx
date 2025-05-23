import PropTypes from 'prop-types';
import { fieldNames } from '../../../functions/common/config';
import { getConfigByTableName } from '../../utils';
import Tag from '../Tag';
import ResultStatusIcons from './ResultStatusIcons';

/**
 * Displays the progress of search operations across multiple layers
 *
 * @returns {JSX.Element}
 */
export default function SearchProgress({
  searchLayerTableNames,
  queryLayers,
  results,
  filterName,
  layerFilterValues,
}) {
  let anyLayersHaveFilterApplied = false;
  const resultsMarkup = searchLayerTableNames.map((tableName) => {
    const config = getConfigByTableName(tableName, queryLayers);
    const resultConfig = results && results[tableName];
    const layerName = config[fieldNames.queryLayers.layerName];
    const hasLayerFilterApplied =
      layerFilterValues &&
      layerFilterValues[tableName]?.some(
        (filterValue) => filterValue.values.length > 0,
      );
    if (hasLayerFilterApplied) {
      anyLayersHaveFilterApplied = true;
    }

    return (
      <li key={tableName} className="mb-1 flex items-center justify-start">
        <ResultStatusIcons resultConfig={resultConfig} layerName={layerName} />
        <span className="leading-5">
          <div>
            {layerName}
            {hasLayerFilterApplied ? (
              <span className="ml-[0.1rem] text-error-500">*</span>
            ) : null}
            {resultConfig?.features ? (
              <Tag>{resultConfig.features.length.toLocaleString()}</Tag>
            ) : null}
          </div>
          {resultConfig?.error ? (
            <div className="text-sm text-error-500">{resultConfig.error}</div>
          ) : null}
        </span>
      </li>
    );
  });

  return (
    <>
      <h3>Search Results</h3>
      <ul>{resultsMarkup}</ul>
      {anyLayersHaveFilterApplied ? (
        <span className="text-sm">
          <span className="ml-[0.1rem] text-error-500">*</span> Designates that
          a layer filter is applied
        </span>
      ) : null}
      <h5>Filter</h5>
      <div className="rounded-full bg-slate-200 px-3 py-1">{filterName}</div>
    </>
  );
}

SearchProgress.propTypes = {
  searchLayerTableNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  queryLayers: PropTypes.arrayOf(
    PropTypes.shape({
      'Table Name': PropTypes.string.isRequired,
      'Layer Name': PropTypes.string.isRequired,
    }),
  ).isRequired,
  results: PropTypes.object,
  filterName: PropTypes.string.isRequired,
  layerFilterValues: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        values: PropTypes.array.isRequired,
      }),
    ),
  ),
};
