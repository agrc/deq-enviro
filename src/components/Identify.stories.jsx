import { fromJSON } from '@arcgis/core/geometry/support/jsonUtils';
import featureJson from '../../tests/fixtures/feature.json';
import fieldsJson from '../../tests/fixtures/fields.json';
import MapProvider from '../contexts/MapProvider';
import Identify from './Identify';

export default {
  title: 'Identify',
  component: Identify,
};

export const Default = () => (
  <div className="h-72 w-full overflow-x-hidden border border-slate-300">
    <MapProvider>
      <Identify
        attributes={featureJson.attributes}
        geometry={fromJSON(featureJson.geometry)}
        fields={fieldsJson}
        onBack={console.log}
        links={[
          {
            text: 'Document Search',
            url: 'https://gis.utah.gov/documents/?OBJECTID={OBJECTID}&ID={ID}',
          },
          {
            text: 'GRAMA Request',
            url: 'https://gis.utah.gov/grama/',
          },
          {
            text: 'Permit Information',
            url: 'https://gis.utah.gov/permit/',
          },
          {
            text: 'Additional Information',
            url: 'https://gis.utah.gov/additional/',
          },
        ]}
      />
    </MapProvider>
  </div>
);
