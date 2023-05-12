import PropTypes from 'prop-types';
import { fieldNames } from '../../config';
import Icon from '../../utah-design-system/Icon';
import Spinner from '../../utah-design-system/Spinner';
import Tooltip from '../../utah-design-system/Tooltip';

export default function Progress({ searchLayers, results }) {
  return (
    <div className="p-2">
      <ul>
        {searchLayers.map((config) => {
          const uniqueId = config[fieldNames.queryLayers.uniqueId];
          const resultConfig = results.find(
            (result) => result[fieldNames.queryLayers.uniqueId] === uniqueId
          );
          const hasError = resultConfig?.error;

          return (
            <li key={uniqueId} className="mb-1 flex items-center justify-start">
              {!resultConfig ? (
                <Spinner className="mr-1" />
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
              <span className="leading-5">
                {config[fieldNames.queryLayers.layerName]}
              </span>
              {resultConfig?.features ? (
                <span className="ml-1 rounded-full bg-slate-200 px-2 py-0 text-sm">
                  {resultConfig.features.length.toLocaleString()}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p>Filter: State of Utah</p>
    </div>
  );
}

Progress.propTypes = {
  searchLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
  results: PropTypes.arrayOf(PropTypes.object).isRequired,
};
