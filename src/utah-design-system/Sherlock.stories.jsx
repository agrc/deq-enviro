import Map from '@arcgis/core/Map';
import '@arcgis/core/assets/esri/themes/light/main.css';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import MapView from '@arcgis/core/views/MapView';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import Sherlock, {
  LocatorSuggestProvider,
  MapServiceProvider,
} from './Sherlock.jsx';

export default {
  title: 'Utah Design System/Sherlock',
  component: Sherlock,
};

const CITIES_URL =
  'https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/UtahMunicipalBoundaries/FeatureServer/0';
const NAME_FIELD = 'NAME';
const ADDRESS_POINTS_URL =
  'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahAddressPoints/FeatureServer/0';
const ADDRESS_FIELD = 'FullAdd';
const CITY_FIELD = 'City';

const FeatureService = ({ url, searchField, contextField }) => {
  const mapDiv = useRef();
  const mapView = useRef();
  const [sherlockMatches, setSherlockMatches] = useState();
  const [config, setConfig] = useState();

  useEffect(() => {
    console.log('init sherlock');

    const map = new Map({ basemap: 'streets-night-vector' });
    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [-71.0589, 42.3601],
      zoom: 12,
    });

    setConfig({
      provider: new MapServiceProvider(url, searchField, {
        contextField,
      }),
      placeHolder: `search by ${searchField}...`,
      onSherlockMatch: (matches) => setSherlockMatches(matches),
      position: 'top-right',
      mapView: view,
      maxResultsToDisplay: 10,
    });

    mapView.current = view;
  }, [url, searchField, contextField]);

  useEffect(() => {
    const giddyUp = async () => {
      if (sherlockMatches) {
        await mapView.current.goTo({
          target: sherlockMatches,
        });

        mapView.current.graphics.addMany(sherlockMatches);

        reactiveUtils.once(
          () => mapView.current.extent,
          () => {
            mapView.current.graphics.removeAll();
          }
        );
      }
    };

    giddyUp();
  }, [sherlockMatches]);

  return (
    <div
      ref={mapDiv}
      style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
    >
      {config ? (
        <Sherlock {...config} className="absolute right-4 top-4 w-80" />
      ) : null}
    </div>
  );
};

FeatureService.propTypes = {
  url: PropTypes.string.isRequired,
  searchField: PropTypes.string.isRequired,
  contextField: PropTypes.string,
};

export const cities = () => (
  <FeatureService url={CITIES_URL} searchField={NAME_FIELD} />
);

export const addressPoints = () => (
  <FeatureService
    url={ADDRESS_POINTS_URL}
    searchField={ADDRESS_FIELD}
    contextField={CITY_FIELD}
  />
);

export const LocatorSuggestion = () => {
  const url =
    'https://masquerade.ugrc.utah.gov/arcgis/rest/services/UtahLocator/GeocodeServer';
  const [matches, setMatches] = useState();

  return (
    <div className="font-sans">
      <Sherlock
        label="Locator Suggestion"
        maxResultsToDisplay={5}
        onSherlockMatch={(matches) => setMatches(matches)}
        placeHolder="search by address..."
        provider={new LocatorSuggestProvider(url, 3857)}
      />
      <pre className="max-h-80 overflow-auto">
        {JSON.stringify(matches, null, '  ')}
      </pre>

      <Sherlock
        label="Broken (for testing error state)"
        maxResultsToDisplay={5}
        placeHolder="search by address..."
        provider={new LocatorSuggestProvider(url + 'asdf', 3857)}
      />
    </div>
  );
};
