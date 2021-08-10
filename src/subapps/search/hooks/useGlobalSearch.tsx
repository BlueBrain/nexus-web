import { DownOutlined } from '@ant-design/icons';
import { constructQuery, constructFilter, addPagination } from '../utils';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { Tooltip, Form, Input, Select, Checkbox, Button, Row } from 'antd';
import { labelOf } from '../../../shared/utils';

const FilterOptions: React.FC<{
  fields: {
    text: string;
    value: string;
  }[];
  onFinish: (values: any) => void;
}> = ({ fields, onFinish }) => {
  return (
    <Form onFinish={onFinish}>
      <Form.Item label="value" name="filterType">
        <Select defaultValue={'allof'} dropdownStyle={{ zIndex: 1100 }}>
          <Select.Option value="allof">All Of</Select.Option>
          <Select.Option value="anyof">Any Of</Select.Option>
          <Select.Option value="noneof">None Of</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="filterTerm">
        <Input.Search style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="filters">
        <Checkbox.Group>
          {fields.map(({ text, value }) => (
            <Row>
              <Checkbox value={`${value}.label.keyword`}>{text}</Checkbox>
            </Row>
          ))}
        </Checkbox.Group>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Apply
        </Button>
      </Form.Item>
    </Form>
  );
};

type actionType = {
  type: 'add';
  payload?: FilterState;
};

type FilterState = {
  filters: string[];
  filterType: string;
  filterTerm: string;
};

function filterReducer(state: FilterState, action: actionType) {
  switch (action.type) {
    case 'add':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

type ConfigField =
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
    };

type SearchConfig = {
  fields: ConfigField[];
};

function renderColumnTitle(
  field: ConfigField,
  filterMenu: JSX.Element
): () => JSX.Element {
  return () => {
    return (
      <div>
        <span>{`${field.label}`}</span>
        <Tooltip trigger="click" placement="topLeft" title={filterMenu}>
          <DownOutlined style={{ float: 'right' }} />
        </Tooltip>
      </div>
    );
  };
}

function rowRenderer(field: ConfigField) {
  return (value: any | any[]) => {
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
  };
}

function makeColumnConfig(searchConfig: SearchConfig, filterMenu: JSX.Element) {
  return searchConfig.fields.map((field: ConfigField) => {
    return {
      title: renderColumnTitle(field, filterMenu),
      dataIndex: field.name,
      key: field.name,
      render: rowRenderer(field),
    };
  });
}

function useGlobalSearchData(
  query: string,
  from: number,
  size: number,
  onSuccess: (queryResponse: any) => void,
  nexus: NexusClient
) {
  const [result, setResult] = React.useState<any>({});
  const [config, setConfig] = React.useState<SearchConfig>();
  const defaultFilter: FilterState = {
    filters: [],
    filterType: '',
    filterTerm: '',
  };
  const [filterState, dispatchFilter] = React.useReducer(
    filterReducer,
    defaultFilter
  );

  const onFilterSubmit = (values: FilterState) => {
    console.log('onFilterSubmit', values);
    dispatchFilter({ type: 'add', payload: values });
  };

  const filterMenu = React.useMemo(() => {
    const fields = config
      ? config.fields.map((field: ConfigField) => {
          return {
            text: field.label,
            value: field.name,
          };
        })
      : [];
    return (
      <FilterOptions fields={fields} onFinish={onFilterSubmit}></FilterOptions>
    );
  }, [config]);

  const esQuery = React.useMemo(() => {
    const baseQuery = constructQuery(query);
    const withFilter = constructFilter(
      baseQuery,
      filterState.filters,
      filterState.filterType,
      filterState.filterTerm
    );
    const withPagination = addPagination(withFilter, from, size);
    return withPagination.build();
  }, [query, filterState, from, size]);

  const columns = React.useMemo(() => {
    return config ? makeColumnConfig(config, filterMenu) : undefined;
  }, [config]);
  const data = React.useMemo(() => {
    if (result.hits && result.hits.hits) {
      return result.hits.hits.map((hit: any) => hit._source);
    }
    return [];
  }, [result]);

  React.useEffect(() => {
    nexus.Search.config().then((response: any) => {
      const searchConfig = response as SearchConfig;
      setConfig(searchConfig);
    });
  }, []);

  React.useEffect(() => {
    nexus.Search.query(esQuery).then((queryResponse: any) => {
      setResult(queryResponse);
      onSuccess(queryResponse);
    });
  }, [esQuery]);
  return { columns, data, dispatchFilter };
}

export default useGlobalSearchData;
