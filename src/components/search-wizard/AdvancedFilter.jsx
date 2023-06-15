import { useState } from 'react';
import { fieldNames } from '../../../functions/common/config';
import { useSearchMachine } from '../../SearchMachineProvider';
import Select from '../../utah-design-system/Select';
import Shape from './filters/Shape';
import Statewide from './filters/Statewide';
import StreetAddress from './filters/StreetAddress';
import WebApiSearch from './filters/WebApiSearch';

export default function AdvancedFilter() {
  const [state, send] = useSearchMachine();
  const filterTypes = {
    statewide: {
      label: 'Statewide',
      Component: Statewide,
    },
    county: {
      label: 'County',
      Component: WebApiSearch,
      props: {
        layer: 'boundaries.county_boundaries',
        searchField: 'name',
        name: 'County',
      },
    },
    city: {
      label: 'City',
      Component: WebApiSearch,
      props: {
        layer: 'boundaries.municipal_boundaries',
        searchField: 'name',
        name: 'City',
      },
    },
    zip: {
      label: 'Zip Code',
      Component: WebApiSearch,
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
      label: 'Name (not yet implemented)',
    },
    id: {
      label: 'ID (not yet implemented)',
    },
    shape: {
      label: 'User-drawn Shape',
      Component: Shape,
    },
    nhd: {
      label: 'NHD Stream Name',
    },
    coordinates: {
      label: 'Coordinates',
    },
  };

  const [filterType, setFilterType] = useState('statewide');

  const getFilterComponent = (filterType) => {
    const { Component, props } = filterTypes[filterType];

    return <Component send={send} {...props} />;
  };

  return (
    <div className="flex-1 overflow-y-auto px-2">
      <h3 className="pt-2">Selected Map Layers</h3>
      <ul>
        {state.context.searchLayers.map((config) => (
          <li
            key={config[fieldNames.queryLayers.uniqueId]}
            className="mb-1 flex items-center justify-start"
          >
            <span className="leading-5">
              {config[fieldNames.queryLayers.layerName]}
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
