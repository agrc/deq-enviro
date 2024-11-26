import { fieldNames } from '../../../functions/common/config';
import { useSearchMachine } from '../../contexts/SearchMachineContext';
import {
  AccordionPanel,
  AccordionRoot,
} from '../../utah-design-system/Accordion';
import QueryLayer from './QueryLayer';

/**
 * @param {object} props
 * @param {import('../../../functions/common/config').QueryLayerConfig[]} props.queryLayers
 * @returns {JSX.Element}
 */
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
      {/* the id below is used in the utah design system header config in App.jsx */}
      <h3 id="select-map-data">Select Map Data</h3>
      <AccordionRoot type="multiple">
        {divisions.sort().map((division) => {
          return (
            <AccordionPanel key={division} title={division}>
              {queryLayers
                .filter(
                  (ql) =>
                    ql[fieldNames.queryLayers.divisionHeading] === division,
                )
                .sort((a, b) =>
                  a[fieldNames.queryLayers.layerName].localeCompare(
                    b[fieldNames.queryLayers.layerName],
                  ),
                )
                .map((queryLayer) => {
                  const tableName =
                    queryLayer[fieldNames.queryLayers.tableName];

                  return (
                    <QueryLayer
                      key={tableName}
                      config={queryLayer}
                      selected={state.context.searchLayerTableNames.some(
                        (selectedTableName) => selectedTableName === tableName,
                      )}
                      onSelectedChange={(selected) =>
                        send({
                          type: selected ? 'SELECT_LAYER' : 'UNSELECT_LAYER',
                          tableName:
                            queryLayer[fieldNames.queryLayers.tableName],
                        })
                      }
                      filterValues={state.context.layerFilterValues[tableName]}
                      onFiltersChange={(newValues) => {
                        send({
                          type: 'UPDATE_LAYER_FILTER_VALUES',
                          tableName,
                          newValues,
                        });
                      }}
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
