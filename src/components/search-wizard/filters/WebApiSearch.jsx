import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Sherlock, {
  WebApiProvider,
} from '../../../utah-design-system/Sherlock.jsx';

export default function WebApiSearch({
  send,
  layer,
  searchField,
  name,
  contextField,
}) {
  const [feature, setFeature] = useState(null);
  const [sherlockConfig, setSherlockConfig] = useState(null);

  useEffect(() => {
    const provider = new WebApiProvider(
      import.meta.env.VITE_WEB_API_KEY,
      layer,
      searchField,
      { contextField }
    );

    // for testing the new cloud native web api
    // provider.webApi.baseUrl = 'https://ut-dts-agrc-web-api-dev.web.app/api/v1/';

    setSherlockConfig({
      provider,
      placeHolder: `start typing a ${name.toLowerCase()}...`,
      onSherlockMatch: setFeature,
      maxResultsToDisplay: 10,
    });
  }, [contextField, layer, name, searchField, setSherlockConfig]);

  useEffect(() => {
    send('SET_FILTER', {
      filter: {
        geometry: feature?.geometry,
        name: `${name}: ${feature?.attributes?.[searchField]}`,
      },
    });
  }, [feature, name, searchField, send]);

  return sherlockConfig && <Sherlock {...sherlockConfig} />;
}

WebApiSearch.propTypes = {
  send: PropTypes.func.isRequired,
  layer: PropTypes.string.isRequired,
  searchField: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  contextField: PropTypes.string,
};
