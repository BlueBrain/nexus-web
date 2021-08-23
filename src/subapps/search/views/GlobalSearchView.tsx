import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { Layout, Table, Tooltip, Checkbox } from 'antd';
import * as bodybuilder from 'bodybuilder';
import { labelOf } from '../../../shared/utils';
import useQueryString from '../../../shared/hooks/useQueryString';
import './SearchView.less';
import '../../../shared/styles/search-tables.less';
import { MenuOutlined } from '@ant-design/icons';
const { Content } = Layout;

const GlobalSearchView: React.FC = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const [queryParams, setQueryString] = useQueryString();
  const { query } = queryParams;

  const onlyHeight = useWindowHeight();

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<any>([]);
  const [result, setResult] = React.useState<any>({});
  const [config, setConfig] = React.useState<SearchConfig>();

  const esQuery = React.useMemo(() => {
    return constructQuery(query);
  }, [query]);
  const columns = React.useMemo(() => {
    return config ? makeColumnConfig(config) : undefined;
  }, [config]);

  const onRowClick = (record: any): { onClick: () => void } => {
    return {
      onClick: () => {
        const projectLabel = record.project.label;
        const resourceId = encodeURIComponent(record['@id']);
        history.push(`/${projectLabel}/resources/${resourceId}`, {
          background: location,
        });
      },
    };
  };
  const handleSelect = (record: any, selected: any) => {
    if (selected) {
      setSelectedRowKeys((keys: any) => [...keys, record.id]);
    } else {
      setSelectedRowKeys((keys: any) => {
        const index = keys.indexOf(record.id);
        return [...keys.slice(0, index), ...keys.slice(index + 1)];
      });
    }
  };

  const toggleSelectAll = () => {
    setSelectedRowKeys((keys: any) =>
      keys.length === data.length ? [] : data.map((r: any) => r.id)
    );
  };

  const data = React.useMemo(() => {
    if (result.hits && result.hits.hits) {
      return result.hits.hits.map((hit: any, i: number) => ({
        ...hit._source,
        ...{ id: i },
      }));
    }
    return [];
  }, [result]);

  React.useEffect(() => {
    nexus.Search.config().then((config: any) => {
      const searchConfig = config as SearchConfig;
      setConfig(searchConfig);
    });
  }, []);

  React.useEffect(() => {
    nexus.Search.query(esQuery).then((result: any) => {
      setResult(result);
    });
  }, [esQuery]);

  const headerCheckbox = (
    <Checkbox
      checked={selectedRowKeys.length}
      indeterminate={
        selectedRowKeys.length > 0 && selectedRowKeys.length < data.length
      }
      onChange={toggleSelectAll}
    />
  );

  const rowSelection = {
    selectedRowKeys,
    onSelect: handleSelect,
    columnTitle: headerCheckbox,
  };

  return (
    <Content
      style={{
        padding: '1em',
        marginTop: '0',
      }}
    >
      <Layout>
        <Content style={{ marginLeft: '0px', marginTop: '0' }}>
          <div className={'result-table'}>
            <Table
              columns={columns}
              dataSource={data}
              pagination={{
                pageSize: Math.floor((onlyHeight - 150) / 35) || 30,
                position: ['topRight'],
              }}
              rowKey={(record: any) => record.id}
              rowSelection={rowSelection}
              onRow={onRowClick}
            ></Table>
          </div>
        </Content>
      </Layout>
    </Content>
  );
};

export default GlobalSearchView;

type SearchConfig = {
  fields: (
    | {
        name: string;
        label: string;
        array: boolean;
        fields: { name: string; format: string }[];
        format?: undefined;
      }
    | {
        name: string;
        label: string;
        format: string;
        array: boolean;
        fields?: undefined;
      }
  )[];
};

function makeColumnConfig(searchConfig: SearchConfig) {
  return searchConfig.fields.map((field: any) => {
    return {
      title: field.label,
      dataIndex: field.name,
      key: field.name,
      filters: [
        {
          text: 'Joe',
          value: 'Joe',
        },
        {
          text: 'Jim',
          value: 'Jim',
        },
      ],
      sorter: (a: any, b: any) => a.name.length - b.name.length,
      filterIcon: (filtered: any) => (
        <MenuOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />
      ),
      render: (value: any | any[]) => {
        // cases :
        // 1. value is text.
        // 2. value is an array of text.
        // 3. value is a link.
        // 4. value is an array of links.
        if (field.array) {
          if (field.fields) {
            const fields = field.fields as any[];
            return (
              <div>
                {value
                  ? value.map((item: any) => item[fields[1].name]).join(', ')
                  : ''}
              </div>
            );
          }
          const valueArray = value as string[];
          const labels = valueArray
            .map((item: string) => {
              return labelOf(item);
            })
            .join(', ');
          return <Tooltip title={labels}>{labels}</Tooltip>;
        }

        // Single link
        if (field.fields) {
          if (value) {
            const fields = field.fields as any[];
            const link = value[fields[0].name];
            const text = value[fields[1].name];
            return (
              <Tooltip
                placement="topLeft"
                title={() => (
                  <a href={link} target="_blank">
                    {text}
                  </a>
                )}
              >
                {text}
              </Tooltip>
            );
          }
          return '';
        }

        // Single value
        return (
          <Tooltip placement="topLeft" title={value}>
            {value}
          </Tooltip>
        );
      },
    };
  });
}

const constructQuery = (searchText: string) => {
  const body = bodybuilder();
  body
    .query('multi_match', {
      query: searchText,
      fuzziness: 5,
      prefix_length: 0,
      fields: ['*'],
    })
    .size(50)
    .from(0);

  return body.build();
};
