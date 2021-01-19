import * as React from 'react';
import { Table, Tooltip, Button, Input, Select } from 'antd';
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
import './../../styles/result-table.less';

const { Search } = Input;
const { Option } = Select;

export interface ResultsGridProps {
  rowSelection?: TableRowSelection<any>;
  pagination: TablePaginationConfig;
  searchResponse: UseSearchResponse;
  fields: ResultTableFields[];
  onClickItem: (resource: Resource) => void;
  isStudio?: boolean;
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
  isStudio,
}) => {
  const [searchValue, setSearchValue] = React.useState<string>('');

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

  const filteredItems = results.filter(item => {
    return (
      Object.values(item)
        .join(' ')
        .toLowerCase()
        .search((searchValue || '').toLowerCase()) >= 0
    );
  });

  const sorter = (dataIndex: string) => {
    return (
      a: {
        [key: string]: any;
      },
      b: {
        [key: string]: any;
      }
    ) => {
      const sortA = a[dataIndex];
      const sortB = b[dataIndex];
      if (sortA < sortB) {
        return -1;
      }
      if (sortA > sortB) {
        return 1;
      }
      return 0;
    };
  };

  const columns: ColumnsType<any> = fields.map(field => {
    // Enrich certain fields with custom rendering
    return match(field.key)
      .with('label', () => ({
        ...field,
        sorter: sorter('label'),
        render: (text: string, resource: Resource) => {
          return getResourceLabel(resource);
        },
      }))
      .with('project', () => ({
        ...field,
        sorter: sorter('project'),
        render: (text: string, resource: Resource) => {
          return `${resource.resourceAdminData.org} | ${resource.resourceAdminData.project}`;
        },
      }))
      .with('schema', () => ({
        ...field,
        sorter: sorter('schema'),
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
        sorter: sorter('@type'),
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
        sorter: sorter(''),
        render: (text: string, resource: Resource) => {
          return text;
        },
      }));
  });

  const [selectedColumns, setSelectedColumns] = React.useState(columns);

  const handleColumnSelect = (value: string[]) => {
    if (value && value.length === 0) {
      setSelectedColumns(columns);
    } else {
      const selected = columns?.filter(x => value.includes(x.title as string));
      setSelectedColumns(selected);
    }
  };

  const handleClickItem = (resource: Resource) => () => {
    onClickItem(resource);
  };

  const renderTitle = () => (
    <div className="header">
      <Search
        className="search"
        value={searchValue}
        onChange={(e: React.FormEvent<HTMLInputElement>) => {
          setSearchValue(e.currentTarget.value);
        }}
      />
      <Select
        allowClear
        mode="multiple"
        size={'middle'}
        placeholder="Please select columns"
        defaultValue={selectedColumns?.map(x => x.title as string)}
        value={selectedColumns?.map(x => x.title as string)}
        onChange={handleColumnSelect}
        className="select-column"
      >
        {columns?.map(x => {
          return (
            <Option key={x.title as string} value={x.title as string}>
              {x.title}
            </Option>
          );
        })}
      </Select>
      <Button
        className="reset"
        onClick={() => {
          setSelectedColumns(columns);
          setSearchValue('');
        }}
        type="primary"
      >
        {' '}
        Reset
      </Button>
    </div>
  );

  return (
    <div className="result-table">
      <Table
        dataSource={filteredItems}
        columns={selectedColumns}
        pagination={pagination}
        bordered
        title={isStudio ? renderTitle : undefined}
        onRow={resource => {
          return {
            onClick: handleClickItem(resource),
          };
        }}
      />
    </div>
  );
};

export default ElasticSearchResultsTable;
