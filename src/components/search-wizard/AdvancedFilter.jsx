import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { fieldNames } from '../../../functions/common/config';
import { useRemoteConfigValues } from '../../contexts/RemoteConfigProvider';
import { useSearchMachine } from '../../contexts/SearchMachineProvider';
import { useFirebase } from '../../contexts/useFirebase';
import stateOfUtahJson from '../../data/state-of-utah.json';
import Select from '../../utah-design-system/Select';
import { getConfigByTableName } from '../../utils';
import Attribute from './filters/Attribute';
import Coordinates from './filters/Coordinates';
import NHDStream from './filters/NHDStream';
import Shape from './filters/Shape';
import Statewide from './filters/Statewide';
import StreetAddress from './filters/StreetAddress';
import WebApi from './filters/WebApi';

// use visible param rather than unmount to preserve state
export default function AdvancedFilter({ visible }) {
  const [state, send] = useSearchMachine();

  const { queryLayers } = useRemoteConfigValues();

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
        label: 'Name',
        selectedLayers: state.context.searchLayerTableNames.map((name) => {
          const config = getConfigByTableName(name, queryLayers);

          return {
            name: config[fieldNames.queryLayers.layerName],
            field: config[fieldNames.queryLayers.nameField],
          };
        }),
        configName: fieldNames.queryLayers.nameField,
      },
    },
    id: {
      label: 'ID',
      Component: Attribute,
      props: {
        label: 'ID',
        selectedLayers: state.context.searchLayerTableNames.map((name) => {
          const config = getConfigByTableName(name, queryLayers);

          return {
            name: config[fieldNames.queryLayers.layerName],
            field: config[fieldNames.queryLayers.idField],
          };
        }),
        configName: fieldNames.queryLayers.idField,
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

  if (state.context.searchLayerTableNames.length === 1) {
    const loneConfig = getConfigByTableName(
      state.context.searchLayerTableNames[0],
      queryLayers,
    );

    const additionalSearches =
      loneConfig[fieldNames.queryLayers.additionalSearches];
    if (additionalSearches.length > 0) {
      additionalSearches.forEach(({ field, label }) => {
        filterTypes[field] = {
          label: `${label} (layer-specific search)`,
          Component: Attribute,
          props: {
            label,
            selectedLayers: state.context.searchLayerTableNames.map((name) => {
              const config = getConfigByTableName(name, queryLayers);

              return {
                name: config[fieldNames.queryLayers.layerName],
                field,
              };
            }),
            fieldName: field,
          },
        };
      });
    }
  }

  const [filterType, setFilterType] = useState('statewide');

  const { logEvent } = useFirebase();
  useEffect(() => {
    logEvent('filter-type-selected', filterType);
  }, [filterType, logEvent]);

  // reset filterType when searchLayerTableNames and filter clear
  useEffect(() => {
    if (
      state.context.searchLayerTableNames.length === 0 &&
      state.context.filter.geometry === stateOfUtahJson &&
      filterType !== 'statewide'
    ) {
      setFilterType('statewide');
    }
  }, [
    filterType,
    state.context.filter.geometry,
    state.context.searchLayerTableNames,
  ]);

  const getFilterComponent = (filterType) => {
    if (!filterTypes[filterType]) {
      console.warn(`No filter type found for ${filterType}`);

      return null;
    }
    const { Component, props } = filterTypes[filterType];

    return <Component send={send} {...props} />;
  };

  return (
    <div className={clsx(!visible && 'hidden')}>
      <h3>Selected Map Layers</h3>
      <ul>
        {state.context.searchLayerTableNames.map((name) => (
          <li key={name} className="mb-1 flex items-center justify-start">
            <span className="leading-5">
              {
                getConfigByTableName(name, queryLayers)[
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
