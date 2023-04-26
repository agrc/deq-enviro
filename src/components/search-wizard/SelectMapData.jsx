import PropTypes from 'prop-types';
import { fieldNames } from '../../config';
import {
  AccordionPanel,
  AccordionRoot,
} from '../utah-design-system/Accordion.jsx';
import QueryLayer from './QueryLayer.jsx';

export default function SelectMapData({ queryLayers }) {
  const divisions = queryLayers.reduce((list, queryLayer) => {
    const division = queryLayer[fieldNames.queryLayers.divisionHeading];
    if (!list.includes(division)) {
      list.push(division);
    }
    return list;
  }, []);

  return (
    <>
      <h4>Select Map Data</h4>
      <AccordionRoot type="multiple">
        {divisions.map((division) => {
          return (
            <AccordionPanel key={division} title={division}>
              {queryLayers
                .filter(
                  (ql) =>
                    ql[fieldNames.queryLayers.divisionHeading] === division
                )
                .map((queryLayer, i) => {
                  return <QueryLayer key={i} config={queryLayer} />;
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
