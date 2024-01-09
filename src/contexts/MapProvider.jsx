import PropTypes from 'prop-types';
import { createContext, useState } from 'react';
import { logEvent } from 'firebase/analytics';
import { useAnalytics } from 'reactfire';

export const MapContext = createContext(null);

/**
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 * @returns {JSX.Element}
 */
export default function MapProvider({ children }) {
  const [mapView, setMapView] = useState(null);
  const [selectedGraphicInfo, setSelectedGraphicInfo] = useState(null);
  const analytics = useAnalytics();

  const zoom = (geometry) => {
    logEvent(analytics, 'zoom_to_feature');

    if (!mapView) {
      console.warn('attempting to zoom before the mapView is set');
    } else {
      if (geometry.type === 'esriGeometryPoint') {
        mapView.goTo({
          center: [geometry.longitude, geometry.latitude],
          zoom: 12,
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
