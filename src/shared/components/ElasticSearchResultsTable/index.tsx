import * as React from 'react';
import { Table, Tooltip } from 'antd';
import { Resource } from '@bbp/nexus-sdk';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import * as prettyBytes from 'pretty-bytes';

import { UseSearchResponse } from '../../hooks/useSearchQuery';
import TypesIconList from '../Types/TypesIcon';
import { getResourceLabel } from '../../utils';
import { convertMarkdownHandlebarStringWithData } from '../../utils/markdownTemplate';
import { parseURL } from '../../utils/nexusParse';
import { FILE_SCHEMA } from '../../types/nexus';
import { match } from 'ts-pattern';
import { TableRowSelection } from 'antd/lib/table/interface';
import { ResultTableFields } from '../../types/search';

export interface ResultsGridProps {
  rowSelection?: TableRowSelection<any>;
  pagination: TablePaginationConfig;
  searchResponse: UseSearchResponse;
  fields: ResultTableFields[];
  onClickItem: (resource: Resource) => void;
}

export const DEFAULT_FIELDS = [
  {
    title: 'Label',
    dataIndex: 'label',
    key: 'label',
  },
  {
    title: 'Project',
    dataIndex: ['resourceAdminData', 'project'],
    key: 'project',
  },
  {
    title: 'Schema',
    dataIndex: '_constrainedBy',
    key: 'schema',
  },
  {
    title: 'Types',
    dataIndex: '@type',
    key: '@type',
  },
];

const ElasticSearchResultsTable: React.FC<ResultsGridProps> = ({
  pagination,
  searchResponse,
  fields,
  rowSelection,
  onClickItem,
}) => {
  const results = (searchResponse.data?.hits.hits || []).map(({ _source }) => {
    const { _original_source, ...everythingElse } = _source;

    const resource = {
      ...JSON.parse(_original_source),
      ...everythingElse,
    };

    return {
      ...resource,
      key: _source._self,
      description: convertMarkdownHandlebarStringWithData(
        resource.description || '',
        resource
      ),
      type: (Array.isArray(resource['@type'])
        ? resource['@type']
        : [resource['@type']]
      ).map(typeURL => typeURL?.split('/').reverse()[0]),
      resourceLabel: getResourceLabel(resource),
      resourceAdminData: parseURL(resource._self),
      fileData: resource._constrainedBy === FILE_SCHEMA && {
        humanReadableFileSize: prettyBytes(resource._bytes),
      },
    };
  });

  const columns: ColumnsType<any> = fields.map(field => {
    // Enrich certain fields with custom rendering
    return match(field.key)
      .with('label', () => ({
        ...field,
        render: (text: string, resource: Resource) => {
          return getResourceLabel(resource);
        },
      }))
      .with('project', () => ({
        ...field,
        render: (text: string, resource: Resource) => {
          return `${resource.resourceAdminData.org} | ${resource.resourceAdminData.project}`;
        },
      }))
      .with('schema', () => ({
        ...field,
        render: (text: string, resource: Resource) => {
          return (
            <Tooltip title={resource._constrainedBy}>
              {text.split('/').reverse()[0]}
            </Tooltip>
          );
        },
      }))
      .with('@type', () => ({
        ...field,
        render: (text: string, resource: Resource) => {
          const typeList =
            !!resource['@type'] &&
            (Array.isArray(resource['@type']) ? (
              <TypesIconList type={resource['@type']} />
            ) : (
              <TypesIconList type={[resource['@type']]} />
            ));
          return typeList;
        },
      }))
      .otherwise(() => ({
        ...field,
        render: (text: string, resource: Resource) => {
          return text;
        },
      }));
  });

  const handleClickItem = (resource: Resource) => () => {
    onClickItem(resource);
  };

  return (
    <Table
      rowSelection={rowSelection}
      dataSource={results}
      columns={columns}
      pagination={pagination}
      onRow={resource => {
        return {
          onClick: handleClickItem(resource),
        };
      }}
    />
  );
};

export default ElasticSearchResultsTable;
