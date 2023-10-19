import { fieldNames } from '../../functions/common/config';
import { useRemoteConfigValues } from '../RemoteConfigProvider';
import * as Tabs from '../utah-design-system/Tabs';
import { useQuery } from '@tanstack/react-query';
import Spinner from '../utah-design-system/Spinner';
import ky from 'ky';
import { getConfigByTableName } from '../utils';
import SimpleTable from '../utah-design-system/SimpleTable';
import { useCallback, useEffect, useState } from 'react';
import Tag from './Tag';

/**
 * @param {Object} props
 * @param {import('../../functions/common/config').RelationshipClassConfig[]} props.relationshipClasses
 * @param {Record<string, string | number | boolean>} props.attributes
 * @returns {JSX.Element}
 */
export default function RelatedRecords({ relationshipClasses, attributes }) {
  const { relatedTables } = useRemoteConfigValues();
  const [counts, setCounts] = useState({});

  const updateCount = useCallback((childTableName, count) => {
    setCounts((counts) => ({ ...counts, [childTableName]: count }));
  }, []);

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
              {counts[childTableName] !== undefined ? (
                <Tag>{counts[childTableName]}</Tag>
              ) : null}
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
          updateCount={updateCount}
        />
      ))}
    </Tabs.Root>
  );
}

function TabContent({
  relationshipClassConfig,
  parentAttributes,
  updateCount,
}) {
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
    const field = featureServiceJson.fields.find(
      (field) => field.name === foreignKeyField,
    );

    if (!field)
      throw new Error(
        `Foreign key field: "${foreignKeyField}" not found in child table: "${childTableName}"!`,
      );

    const wrapper = field.type === 'esriFieldTypeString' ? `'` : '';
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

  const Wrapper = ({ children }) => (
    <Tabs.Content value={childTableName}>{children}</Tabs.Content>
  );

  useEffect(() => {
    if (query.data) {
      updateCount(childTableName, query.data.rows.length);
    }
  }, [childTableName, query.data, updateCount]);

  if (query.status === 'loading') {
    return (
      <Wrapper>
        <div className="flex h-full w-full items-center justify-center">
          <Spinner
            ariaLabel="loading indicator"
            size="custom"
            className="h-10 w-10"
          />
        </div>
      </Wrapper>
    );
  }

  if (query.status === 'error') {
    return (
      <Wrapper>
        <div className="px-2 text-error-500">
          <p>There was an error getting the related data:</p>
          <p>
            {
              // @ts-ignore
              query.error?.message
            }
          </p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {query.data.rows.length > 0 ? (
        <SimpleTable
          className="h-full min-h-0 w-full overflow-auto"
          data={query.data.rows}
          columns={query.data.columns}
          caption={`${childTableName} records`}
        />
      ) : (
        <div className="px-2">No related records found.</div>
      )}
    </Wrapper>
  );
}
