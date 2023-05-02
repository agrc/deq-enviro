import { fieldNames } from '../../config';
import Checkbox from '../utah-design-system/Checkbox';

export default function QueryLayer({ config }) {
  const id = `query-layer-${config[fieldNames.queryLayers.name]}`;

  // todo - use logEvent from 'firebase/analytics' to log which layers are selected
  return <Checkbox name={id} label={config[fieldNames.queryLayers.name]} />;
}
