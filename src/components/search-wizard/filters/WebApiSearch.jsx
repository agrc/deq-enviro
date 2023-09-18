import { union } from '@arcgis/core/geometry/geometryEngine';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Sherlock, {
  WebApiProvider,
} from '../../../utah-design-system/Sherlock.jsx';

export default function WebApiSearch({
  contextField,
  layer,
  name,
  onChange,
  searchField,
}) {
  const [features, setFeatures] = useState(null);
  const [sherlockConfig, setSherlockConfig] = useState(null);

  useEffect(() => {
    const provider = new WebApiProvider(
      // import.meta.env.VITE_WEB_API_KEY,
      'agrc-dev',
      layer,
      searchField,
      { contextField },
    );

    // for testing the new cloud native web api
    provider.webApi.baseUrl = 'https://ut-dts-agrc-web-api-dev.web.app/api/v1/';

    setSherlockConfig({
      provider,
      placeHolder: `start typing a ${name.toLowerCase()}...`,
      onSherlockMatch: setFeatures,
      maxResultsToDisplay: 10,
    });
  }, [contextField, layer, name, searchField, setSherlockConfig]);

  useEffect(() => {
    if (features?.length) {
      onChange(
        union(features.map((feature) => feature.geometry)),
        `${name}: ${features[0].attributes[searchField]}`,
      );
    } else {
      onChange(null, null);
    }
  }, [features, name, onChange, searchField]);

  return sherlockConfig && <Sherlock {...sherlockConfig} />;
}

WebApiSearch.propTypes = {
  contextField: PropTypes.string,
  layer: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  searchField: PropTypes.string.isRequired,
};
