import { fieldNames } from '../../config';

export default function QueryLayer({ config }) {
  const id = `query-layer-${config[fieldNames.queryLayers.name]}`;

  // todo - use logEvent from 'firebase/analytics' to log which layers are selected
  return (
    <div className="input-wrapper input-wrapper--checkbox">
      <label htmlFor={id}>{config[fieldNames.queryLayers.name]}</label>
      <input type="checkbox" id={id} className="flex-shrink-0" />
    </div>
  );
}
