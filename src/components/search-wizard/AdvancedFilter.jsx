import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { fieldNames } from '../../../functions/common/config';
import { useSearchMachine } from '../../SearchMachineProvider';
import Select from '../../utah-design-system/Select';
import Attribute from './filters/Attribute';
import Coordinates from './filters/Coordinates';
import NHDStream from './filters/NHDStream';
import Shape from './filters/Shape';
import Statewide from './filters/Statewide';
import StreetAddress from './filters/StreetAddress';
import WebApi from './filters/WebApi';
import stateOfUtahJson from '../../data/state-of-utah.json';
import { useRemoteConfigString } from 'reactfire';
import { getLayerByUniqueId } from '../../utils';

// use visible param rather than unmount to preserve state
export default function AdvancedFilter({ visible }) {
  const [state, send] = useSearchMachine();

  const { data: queryLayersJSON } = useRemoteConfigString('queryLayers');
  const queryLayers = JSON.parse(queryLayersJSON || '[]');

  const filterTypes = {
    statewide: {
      label: 'Statewide',
      Component: Statewide,
    },
    county: {
      label: 'County',
      Component: WebApi,
      props: {
        layer: 'boundaries.county_boundaries',
        searchField: 'name',
        name: 'County',
      },
    },
    city: {
      label: 'City',
      Component: WebApi,
      props: {
        layer: 'boundaries.municipal_boundaries',
        searchField: 'name',
        name: 'City',
      },
    },
    zip: {
      label: 'Zip Code',
      Component: WebApi,
      props: {
        layer: 'boundaries.zip_code_areas',
        searchField: 'zip5',
        name: 'Zip Code',
      },
    },
    address: {
      label: 'Street Address',
      Component: StreetAddress,
    },
    name: {
      label: 'Name',
      Component: Attribute,
      props: {
        attributeType: 'name',
        selectedLayers: state.context.searchLayerIds.map((uniqueId) => {
          const config = getLayerByUniqueId(uniqueId, queryLayers);

          return {
            name: config[fieldNames.queryLayers.layerName],
            field: config[fieldNames.queryLayers.nameField],
          };
        }),
      },
    },
    id: {
      label: 'ID',
      Component: Attribute,
      props: {
        attributeType: 'id',
        selectedLayers: state.context.searchLayerIds.map((uniqueId) => {
          const config = getLayerByUniqueId(uniqueId, queryLayers);

          return {
            name: config[fieldNames.queryLayers.layerName],
            field: config[fieldNames.queryLayers.idField],
          };
        }),
      },
    },
    shape: {
      label: 'User-drawn Shape',
      Component: Shape,
    },
    nhd: {
      label: 'NHD Stream Name',
      Component: NHDStream,
    },
    coordinates: {
      label: 'Coordinates',
      Component: Coordinates,
    },
  };

  const [filterType, setFilterType] = useState('statewide');

  // reset filterType when searchLayerIds and filter clear
  useEffect(() => {
    if (
      state.context.searchLayerIds.length === 0 &&
      state.context.filter.geometry === stateOfUtahJson &&
      filterType !== 'statewide'
    ) {
      setFilterType('statewide');
    }
  }, [filterType, state.context.filter.geometry, state.context.searchLayerIds]);

  const getFilterComponent = (filterType) => {
    const { Component, props } = filterTypes[filterType];

    return <Component send={send} {...props} />;
  };

  return (
    <div className={clsx(!visible && 'hidden')}>
      <h3>Selected Map Layers</h3>
      <ul>
        {state.context.searchLayerIds.map((uniqueId) => (
          <li key={uniqueId} className="mb-1 flex items-center justify-start">
            <span className="leading-5">
              {
                getLayerByUniqueId(uniqueId, queryLayers)[
                  fieldNames.queryLayers.layerName
                ]
              }
            </span>
          </li>
        ))}
      </ul>
      <h3 className="pt-2">Select Filter Type</h3>
      <Select
        items={Object.entries(filterTypes).map(([value, { label }]) => ({
          value,
          label,
        }))}
        value={filterType}
        onValueChange={setFilterType}
        className="mb-2"
      />
      {getFilterComponent(filterType)}
    </div>
  );
}

AdvancedFilter.propTypes = {
  visible: PropTypes.bool.isRequired,
};
