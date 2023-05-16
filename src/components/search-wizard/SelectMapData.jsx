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
    <div className="flex-1 overflow-y-auto px-2">
      <h3 className="pt-2">Select Map Data</h3>
      <AccordionRoot type="multiple">
        {divisions.map((division) => {
          return (
            <AccordionPanel key={division} title={division}>
              {queryLayers
                .filter(
                  (ql) =>
                    ql[fieldNames.queryLayers.divisionHeading] === division
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
    </div>
  );
}

SelectMapData.propTypes = {
  queryLayers: PropTypes.array.isRequired,
};
