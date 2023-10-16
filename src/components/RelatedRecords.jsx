import { fieldNames } from '../../functions/common/config';
import { useRemoteConfigValues } from '../RemoteConfigProvider';
import * as Tabs from '../utah-design-system/Tabs';
import { useQuery } from '@tanstack/react-query';
import Spinner from '../utah-design-system/Spinner';
import ky from 'ky';
import { getConfigByTableName } from '../utils';
import SimpleTable from '../utah-design-system/SimpleTable';

/**
 * @param {Object} props
 * @param {import('../../functions/common/config').RelationshipClassConfig[]} props.relationshipClasses
 * @param {Record<string, string | number | boolean>} props.attributes
 * @returns {JSX.Element}
 */
export default function RelatedRecords({ relationshipClasses, attributes }) {
  const { relatedTables } = useRemoteConfigValues();

  return (
    <Tabs.Root
      className="h-full w-full border border-slate-300"
      defaultValue={
        relationshipClasses[0][fieldNames.relationshipClasses.relatedTableName]
      }
      orientation="horizontal"
    >
      <Tabs.List aria-label="related tables">
        {relationshipClasses.map((relationshipClassConfig) => {
          const childTableName =
            relationshipClassConfig[
              fieldNames.relationshipClasses.relatedTableName
            ];
          const childConfig = getConfigByTableName(
            childTableName,
            relatedTables,
          );

          return (
            <Tabs.Trigger key={childTableName} value={childTableName}>
              {childConfig[fieldNames.relatedTables.tabName]}
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>
      {relationshipClasses.map((relationshipClassConfig) => (
        <TabContent
          key={
            relationshipClassConfig[
              fieldNames.relationshipClasses.relatedTableName
            ]
          }
          relationshipClassConfig={relationshipClassConfig}
          parentAttributes={attributes}
        />
      ))}
    </Tabs.Root>
  );
}

function TabContent({ relationshipClassConfig, parentAttributes }) {
  const { relatedTables } = useRemoteConfigValues();
  const childTableName =
    relationshipClassConfig[fieldNames.relationshipClasses.relatedTableName];
  const childConfig = getConfigByTableName(childTableName, relatedTables);
  const primaryKeyField =
    relationshipClassConfig[fieldNames.relationshipClasses.primaryKey];
  const foreignKeyField =
    relationshipClassConfig[fieldNames.relationshipClasses.foreignKey];

  async function getData() {
    const featureServiceUrl = `${
      childConfig[fieldNames.relatedTables.featureService]
    }`;

    /**
     * @type {Object} FeatureServiceJson
     * @property {Object[]} fields
     */
    const featureServiceJson = await ky(`${featureServiceUrl}?f=json`).json();
    const fieldType = featureServiceJson.fields.find(
      (field) => field.name === foreignKeyField,
    ).type;

    const wrapper = fieldType === 'esriFieldTypeString' ? `'` : '';
    const where = `${foreignKeyField} = ${wrapper}${parentAttributes[primaryKeyField]}${wrapper}`;

    const params = {
      f: 'json',
      where,
      outFields: '*',
      returnGeometry: false,
    };

    /** @type {import('@arcgis/core/rest/support/FeatureSet').default} */
    const relatedRecords = await ky(`${featureServiceUrl}/query`, {
      searchParams: params,
    }).json();

    const oidField = featureServiceJson.objectIdField || 'OBJECTID';

    return {
      childTableName,
      tabName: childConfig[fieldNames.relatedTables.tabName],
      rows: relatedRecords.features.map((feature) => feature.attributes),
      columns: featureServiceJson.fields
        .filter((field) => field.name !== oidField)
        .map((field) => ({
          Header: field.alias,
          accessorKey: field.name,
        })),
    };
  }

  const query = useQuery({
    queryKey: ['relatedTables', childTableName, parentAttributes],
    queryFn: getData,
  });

  if (query.status === 'loading') {
    return <Spinner ariaLabel="loading indicator" />;
  }

  if (query.status === 'error') {
    return <div>error getting related data</div>;
  }

  return (
    <Tabs.Content value={childTableName}>
      {query.data.rows.length > 0 ? (
        <SimpleTable
          className="h-full w-full overflow-x-auto"
          data={query.data.rows}
          columns={query.data.columns}
          caption={`${childTableName} records`}
        />
      ) : (
        <div className="px-2">No related records found.</div>
      )}
    </Tabs.Content>
  );
}
