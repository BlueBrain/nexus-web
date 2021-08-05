import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { Layout, Table, Tooltip } from 'antd';
import * as bodybuilder from 'bodybuilder';
import { labelOf } from '../../../shared/utils';
import useQueryString from '../../../shared/hooks/useQueryString';
import './SearchView.less';
import '../../../shared/styles/search-tables.less';
import _ from 'lodash';

const { Content } = Layout;

const GlobalSearchView: React.FC = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const [queryParams, setQueryString] = useQueryString();
  const { query } = queryParams;

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

  const data = React.useMemo(() => {
    if (result.hits && result.hits.hits) {
      return result.hits.hits.map((hit: any) => hit._source);
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
              pagination={false}
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
                  ? value
                      .map((item: any) => {
                        const link = item[fields[0].name];
                        const text = item[fields[1].name];
                        return text;
                      })
                      .join(', ')
                  : ''}
              </div>
            );
          }
          const valueArray = value as Array<string>;
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
              <Tooltip placement="topLeft" title={link}>
                <a href={link} target="_blank">
                  {text}
                </a>
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

const makeResourceUri = (
  orgLabel: string,
  projectLabel: string,
  resourceId: string
) => {
  return `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
    resourceId
  )}`;
};

const goToResource = (
  orgLabel: string,
  projectLabel: string,
  resourceId: string
) => {
  const newURL = makeResourceUri(orgLabel, projectLabel, resourceId);

  // history.push(newURL, {
  //   background: location,
  // });
};
