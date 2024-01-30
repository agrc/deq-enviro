import { fieldNames } from '../../../functions/common/config';
import Checkbox from '../../utah-design-system/Checkbox';
import Icon from '../../utah-design-system/Icon';
import Tooltip from '../../utah-design-system/Tooltip';
import clsx from 'clsx';
import Popup, { CloseButton } from '../../utah-design-system/Popup';
import SpecialFilter from './SpecialFilter';
import { Fragment } from 'react';
import Button from '../../utah-design-system/Button';

/**
 * @typedef {import('../../../functions/common/config').FieldFilterConfig} FieldFilterConfig
 *
 *
 * @typedef {import('../../contexts/SearchMachineProvider').LayerFilterValue} LayerFilterValue
 */

/**
 * @param {FieldFilterConfig
 *   | import('../../../functions/common/config').CheckboxRadioQueriesFilterConfig
 *   | import('../../../functions/common/config').DateFilterConfig} filterConfig
 * @param {LayerFilterValue[]} filterValues
 * @returns {number}
 */
function getFilterValueIndex(filterConfig, filterValues) {
  if (!filterValues) {
    return -1;
  }

  const index = filterValues.findIndex((filter) => {
    const typesMatch = filter.type === filterConfig.type;
    if (/** @type {FieldFilterConfig} */ (filterConfig).field) {
      return (
        typesMatch &&
        filter.field === /** @type {FieldFilterConfig} */ (filterConfig).field
      );
    }

    return typesMatch;
  });

  return index;
}

/**
 * @param {Object} props
 * @param {import('../../../functions/common/config').QueryLayerConfig} props.config
 * @param {boolean} props.selected
 * @param {(checked: boolean) => void} props.onSelectedChange
 * @param {LayerFilterValue[]} [props.filterValues]
 * @param {(
 *   newValues:
 *     | LayerFilterValue[]
 *     | ((oldValues: LayerFilterValue[]) => LayerFilterValue[]),
 * ) => void} props.onFiltersChange
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
                  <span className="absolute flex h-1.5 w-1.5 rounded-full bg-accent-dark"></span>
                ) : null}
                <Icon
                  name="gear"
                  className={clsx(
                    'ml-0 cursor-pointer text-slate-600',
                    (!filterValues || filterValues.length === 0) &&
                      'opacity-50',
                  )}
                  label="filters"
                />
              </div>
            }
          >
            <div className="flex items-center justify-between">
              <h5>Filter Layer</h5>
              <CloseButton />
            </div>
            <div className="flex max-h-96 max-w-96 flex-col">
              <div className="flex-1 overflow-y-auto">
                {specialFilters.map((filterConfig, index) => {
                  const filterValueIndex = getFilterValueIndex(
                    filterConfig,
                    filterValues,
                  );
                  return (
                    <Fragment key={index}>
                      {index > 0 && <hr />}
                      <SpecialFilter
                        key={filterConfig.name}
                        config={filterConfig}
                        value={
                          filterValues ? filterValues[filterValueIndex] : null
                        }
                        onChange={(newValue) => {
                          if (filterValueIndex === -1) {
                            onFiltersChange([newValue]);
                          } else {
                            filterValues.splice(filterValueIndex, 1, newValue);
                            onFiltersChange(filterValues);
                          }
                        }}
                      />
                    </Fragment>
                  );
                })}
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
                <Icon
                  name="externalLink"
                  className="text-slate-600"
                  label="more info"
                  size="xs"
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
