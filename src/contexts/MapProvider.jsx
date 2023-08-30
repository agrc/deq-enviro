import PropTypes from 'prop-types';
import { createContext, useState } from 'react';

export const MapContext = createContext();
export default function MapProvider({ children }) {
  const [mapView, setMapView] = useState(null);
  const [selectedGraphicInfo, setSelectedGraphicInfo] = useState(null);

  const zoom = (geometry) => {
    if (!mapView) {
      console.warn('attempting to zoom before the mapView is set');
    } else {
      mapView.goTo(geometry);
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
