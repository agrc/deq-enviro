import { downloadFormats, fieldNames } from '../../../functions/common/config';
import Checkbox from '../../utah-design-system/Checkbox';
import Icon from '../../utah-design-system/Icon';
import RadioGroup from '../../utah-design-system/RadioGroup';

/**
 * @param {Object} props
 * @param {Record<
 *   string,
 *   import('../../contexts/SearchMachine').QueryLayerResult
 * >} props.searchResultLayers
 * @param {string[]} props.selectedLayers
 * @param {function} props.setSelectedLayers
 * @param {string} props.format
 * @param {(value: string) => void} props.setFormat
 * @param {string} [props.error]
 */
export default function Download({
  searchResultLayers,
  selectedLayers,
  setSelectedLayers,
  format,
  setFormat,
  error,
}) {
  const relevantResultLayers = Object.keys(searchResultLayers)
    .map((tableName) => searchResultLayers[tableName])
    .filter((result) => !result.error && result.features.length > 0);

  const getOnChangeHandler = (tableName) => (checked) => {
    if (checked) {
      setSelectedLayers([...selectedLayers, tableName]);
    } else {
      setSelectedLayers(selectedLayers.filter((layer) => layer !== tableName));
    }
  };

  const formats = [
    {
      label: 'CSV',
      value: downloadFormats.csv,
    },
    {
      label: 'Excel',
      value: downloadFormats.excel,
    },
    {
      label: 'File Geodatabase',
      value: downloadFormats.filegdb,
    },
    {
      label: 'GeoJSON',
      value: downloadFormats.geojson,
    },
    {
      label: 'Shapefile',
      value: downloadFormats.shapefile,
    },
  ];

  return (
    <>
      <h3>Select Data for Download</h3>
      {relevantResultLayers.map((searchLayer) => {
        const tableName = searchLayer[fieldNames.queryLayers.tableName];
        const layerName = searchLayer[fieldNames.queryLayers.layerName];

        return (
          <Checkbox
            key={tableName}
            checked={selectedLayers.includes(tableName)}
            label={layerName}
            onCheckedChange={getOnChangeHandler(tableName)}
          ></Checkbox>
        );
      })}
      <h3 className="mt-2">Format</h3>
      <RadioGroup
        items={formats}
        ariaLabel={'Select a format'}
        value={format}
        onValueChange={setFormat}
      />

      {error ? (
        <p className="mt-4 flex align-middle text-error-500">
          <Icon
            name="error"
            className="mr-1"
            label="error message"
            size="3xl"
          />
          There was an error downloading the data: {error}
        </p>
      ) : null}
    </>
  );
}
