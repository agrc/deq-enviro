import Identify from './Identify';
import featureJson from '../../tests/fixtures/feature.json';
import fieldsJson from '../../tests/fixtures/fields.json';

export default {
  title: 'Identify',
  component: Identify,
};

export const Default = () => (
  <div className="border border-slate-300 w-full h-72 overflow-x-hidden">
    <Identify
      attributes={featureJson}
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
  </div>
);
