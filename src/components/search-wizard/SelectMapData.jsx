import PropTypes from 'prop-types';
import { fieldNames } from '../../../functions/common/config';
import { useSearchMachine } from '../../SearchMachineProvider.jsx';
import {
  AccordionPanel,
  AccordionRoot,
} from '../../utah-design-system/Accordion.jsx';
import QueryLayer from './QueryLayer.jsx';

export default function SelectMapData({ queryLayers }) {
  const divisions = queryLayers.reduce((list, queryLayer) => {
    const division = queryLayer[fieldNames.queryLayers.divisionHeading];
    if (!list.includes(division)) {
      list.push(division);
    }
    return list;
  }, []);
  const [state, send] = useSearchMachine();

  return (
    <>
      <h3 className="pt-2">Select Map Data</h3>
      <AccordionRoot type="multiple">
        {divisions.sort().map((division) => {
          return (
            <AccordionPanel key={division} title={division}>
              {queryLayers
                .filter(
                  (ql) =>
                    ql[fieldNames.queryLayers.divisionHeading] === division
                )
                .sort((a, b) =>
                  a[fieldNames.queryLayers.layerName].localeCompare(
                    b[fieldNames.queryLayers.layerName]
                  )
                )
                .map((queryLayer) => {
                  const uniqueId = queryLayer[fieldNames.queryLayers.uniqueId];

                  return (
                    <QueryLayer
                      key={uniqueId}
                      config={queryLayer}
                      selected={state.context.searchLayers.some(
                        (config) =>
                          config[fieldNames.queryLayers.uniqueId] === uniqueId
                      )}
                      onSelectedChange={(selected) =>
                        send({
                          type: selected ? 'SELECT_LAYER' : 'UNSELECT_LAYER',
                          queryLayer,
                        })
                      }
                    />
                  );
                })}
            </AccordionPanel>
          );
        })}
      </AccordionRoot>
    </>
  );
}

SelectMapData.propTypes = {
  queryLayers: PropTypes.array.isRequired,
};
