import PropTypes from 'prop-types';
import { fieldNames } from '../../../functions/common/config';
import Icon from '../../utah-design-system/Icon';
import Spinner from '../../utah-design-system/Spinner';
import Tooltip from '../../utah-design-system/Tooltip';

export default function Progress({ searchLayers, results }) {
  return (
    <div className="flex-1 p-2">
      <h3>Search Results</h3>
      <ul>
        {searchLayers.map((config) => {
          const uniqueId = config[fieldNames.queryLayers.uniqueId];
          const resultConfig = results.find(
            (result) => result[fieldNames.queryLayers.uniqueId] === uniqueId
          );
          const hasError = resultConfig?.error;
          const layerName = config[fieldNames.queryLayers.layerName];

          return (
            <li key={uniqueId} className="mb-1 flex items-center justify-start">
              {!resultConfig ? (
                <Spinner
                  className="mr-1"
                  ariaLabel={`searching ${layerName}`}
                  size={Spinner.Sizes.lg}
                />
              ) : hasError ? (
                <Tooltip
                  trigger={
                    <Icon
                      name={Icon.Names.error}
                      className="mr-1 w-5 text-red-500"
                      size="lg"
                      label="error message"
                    />
                  }
                >
                  {resultConfig.error}
                </Tooltip>
              ) : (
                <Icon
                  name={Icon.Names.checkmark}
                  className="mr-1 w-5 text-emerald-500"
                  size="lg"
                  label="success"
                />
              )}
              <span className="leading-5">{layerName}</span>
              {resultConfig?.features ? (
                <span className="ml-1 rounded-full bg-slate-100 px-2 py-0 text-sm">
                  {resultConfig.features.length.toLocaleString()}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      <h5>Filter</h5>
      <span className="rounded-full bg-slate-200 px-2 py-1">State of Utah</span>
    </div>
  );
}

Progress.propTypes = {
  searchLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
  results: PropTypes.arrayOf(PropTypes.object).isRequired,
};
