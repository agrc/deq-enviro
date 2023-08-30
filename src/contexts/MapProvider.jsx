import PropTypes from 'prop-types';
import { createContext, useState } from 'react';

export const MapContext = createContext();
export default function MapProvider({ children }) {
  const [mapView, setMapView] = useState(null);
  const [selectedGraphicInfo, setSelectedGraphicInfo] = useState(null);

  return (
    <MapContext.Provider
      value={{
        mapView,
        setMapView,
        selectedGraphicInfo,
        setSelectedGraphicInfo,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

MapProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
