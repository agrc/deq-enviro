import PropTypes from 'prop-types';
import { useState } from 'react';
import { MapContext } from './MapContext';
import { useFirebase } from './useFirebase';

export default function MapProvider({ children }) {
  const [mapView, setMapView] = useState(null);
  const [selectedGraphicInfo, setSelectedGraphicInfo] = useState(null);
  const { logEvent } = useFirebase();

  const zoom = (geometry) => {
    logEvent('zoom-to-feature');

    if (!mapView) {
      console.warn('attempting to zoom before the mapView is set');
    } else {
      if (geometry.type === 'point') {
        mapView.goTo({
          center: [geometry.longitude, geometry.latitude],
          zoom: 16,
        });
      } else {
        mapView.goTo(geometry);
      }
    }
  };

  return (
    <MapContext.Provider
      value={{
        mapView,
        setMapView,
        selectedGraphicInfo,
        setSelectedGraphicInfo,
        zoom,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

MapProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
