import PropTypes from 'prop-types';
import { fieldNames } from '../../../functions/common/config';
import Checkbox from '../../utah-design-system/Checkbox';
import Icon from '../../utah-design-system/Icon';
import Tooltip from '../../utah-design-system/Tooltip';

/**
 * @param {Object} props
 * @param {import('../../../functions/common/config').QueryLayerConfig} props.config
 * @param {boolean} props.selected
 * @param {(checked: boolean) => void} props.onSelectedChange
 * @returns {JSX.Element}
 */
export default function QueryLayer({
  config,
  selected,
  onSelectedChange,
  // filter,
  // onFilterChange,
}) {
  const id = `query-layer-${config[fieldNames.queryLayers.uniqueId]}`;

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
  );
}

QueryLayer.propTypes = {
  config: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelectedChange: PropTypes.func.isRequired,
  // filter: PropTypes.object,
  // onFilterChange: PropTypes.func.isRequired,
};
