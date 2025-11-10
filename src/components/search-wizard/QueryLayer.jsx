import { clsx } from 'clsx';
import { ExternalLinkIcon, FilterIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { fieldNames } from '../../../functions/common/config';
import Button from '../../utah-design-system/Button';
import Checkbox from '../../utah-design-system/Checkbox';
import Popup, { CloseButton } from '../../utah-design-system/Popup';
import Tooltip from '../../utah-design-system/Tooltip';
import SpecialFilter from './SpecialFilter';

/**
 * Type definitions for component
 *
 * @typedef {import('../../../functions/common/config').FieldFilterConfig} FieldFilterConfig
 *
 *
 * @typedef {import('../../contexts/SearchMachine').LayerFilterValue} LayerFilterValue
 */

/**
 * Represents a query layer with filter options
 *
 * @returns {JSX.Element}
 */
export default function QueryLayer({
  config,
  selected,
  onSelectedChange,
  filterValues,
  onFiltersChange,
}) {
  const id = `query-layer-${config[fieldNames.queryLayers.tableName]}`;
  const specialFilters = config[fieldNames.queryLayers.specialFilters];

  return (
    <div className="my-2 flex items-center justify-between">
      <Tooltip
        delayDuration={1000}
        trigger={
          <span>
            <Checkbox
              name={id}
              label={config[fieldNames.queryLayers.layerName]}
              onCheckedChange={onSelectedChange}
              checked={selected}
            />
          </span>
        }
      >
        <div className="max-w-md">
          {config[fieldNames.queryLayers.layerDescription]}
        </div>
      </Tooltip>
      <div className="flex justify-center space-x-1">
        {specialFilters.length ? (
          <Popup
            trigger={
              <div className="relative" title="Data Filters">
                {filterValues && filterValues.length > 0 ? (
                  <span className="absolute bottom-0.5 left-[-1px] flex h-1.5 w-1.5 rounded-full bg-accent-dark"></span>
                ) : null}
                <FilterIcon
                  className={clsx(
                    'ml-0 size-5 cursor-pointer text-slate-600',
                    (!filterValues || filterValues.length === 0) &&
                      'opacity-50',
                  )}
                  label="filters"
                />
              </div>
            }
          >
            <div className="flex items-center justify-between">
              <h5>Data Filters</h5>
              <CloseButton />
            </div>
            <div className="flex max-h-96 max-w-96 flex-col">
              <div className="flex-1 overflow-y-auto">
                {specialFilters.map(
                  (
                    /**
                     * @type {import('../../../functions/common/config').FieldFilterConfig
                     *   | import('../../../functions/common/config').CheckboxRadioQueriesFilterConfig
                     *   | import('../../../functions/common/config').DateFilterConfig}
                     */ filterConfig,
                    /** @type {number} */ index,
                  ) => {
                    return (
                      <Fragment key={index}>
                        {index > 0 && <hr />}
                        <SpecialFilter
                          config={filterConfig}
                          value={filterValues ? filterValues[index] : null}
                          onChange={(newValue) => {
                            const newFilterValues = filterValues?.length
                              ? [...filterValues]
                              : [];
                            newFilterValues[index] = newValue;
                            onFiltersChange(newFilterValues);
                          }}
                        />
                      </Fragment>
                    );
                  },
                )}
              </div>
              <Button className="w-full" onClick={() => onFiltersChange([])}>
                Clear Filters
              </Button>
            </div>
          </Popup>
        ) : null}
        {config[fieldNames.queryLayers.metadataLink] ? (
          <Tooltip
            trigger={
              <a
                href={config[fieldNames.queryLayers.metadataLink]}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLinkIcon
                  className="size-5 text-slate-600"
                  label="more info"
                />
              </a>
            }
          >
            More Info
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}

QueryLayer.propTypes = {
  config: PropTypes.shape({
    'Table Name': PropTypes.string.isRequired,
    'Layer Name': PropTypes.string.isRequired,
    'Special Filters': PropTypes.array,
  }).isRequired,
  selected: PropTypes.bool.isRequired,
  onSelectedChange: PropTypes.func.isRequired,
  filterValues: PropTypes.array,
  onFiltersChange: PropTypes.func.isRequired,
};
