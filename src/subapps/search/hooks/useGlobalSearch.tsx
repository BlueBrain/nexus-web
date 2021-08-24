import {
  DownOutlined,
  EyeInvisibleOutlined,
  FunnelPlotOutlined,
} from '@ant-design/icons';
import { constructQuery, constructFilterSet, addPagination } from '../utils';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { Button, Tooltip } from 'antd';
import { labelOf } from '../../../shared/utils';
import FilterOptions, { extractFieldName } from '../containers/FilterOptions';
import '../containers/SearchContainer.less';

export type SearchConfigField =
  | {
      title: () => JSX.Element;
      dataIndex: string;
      key: string;
      render: (value: any) => JSX.Element | '';
      label: string;
    }[]
  | undefined;

type actionType = {
  type: 'add' | 'remove';
  payload: FilterState;
};

export type FilterState = {
  filters: string[];
  filterType: string;
  filterTerm: string;
};

function filterReducer(
  state: FilterState[],
  action: actionType
): FilterState[] {
  switch (action.type) {
    case 'add':
      return [
        ...state.filter(
          fieldFilter => fieldFilter.filterTerm !== action.payload.filterTerm
        ),
        action.payload,
      ];
    case 'remove':
      return state.filter(
        fieldFilter => fieldFilter.filterTerm !== action.payload.filterTerm
      );
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
  filterMenu: (field: ConfigField) => JSX.Element,
  hasFilterApplied: boolean
): () => JSX.Element {
  return () => {
    return (
      <div className="column-header">
        <span>{`${field.label}`}</span>
        <Tooltip
          trigger="click"
          placement="topLeft"
          title={filterMenu(field)}
          overlayInnerStyle={{ width: '400px' }}
        >
          <div className="column-header__options">
            {hasFilterApplied && <FunnelPlotOutlined />}
            <DownOutlined />
          </div>
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

function makeColumnConfig(
  searchConfig: SearchConfig,
  filterMenu: (field: ConfigField) => JSX.Element,
  filteredFields: string[]
) {
  return searchConfig.fields.map((field: ConfigField) => {
    return {
      title: renderColumnTitle(
        field,
        filterMenu,
        filteredFields.includes(field.name)
      ),
      dataIndex: field.name,
      key: field.name,
      render: rowRenderer(field),
      label: field.label,
    };
  });
}
export type ColumnVisibility = {
  key: string;
  name: string;
  visible: boolean;
};

function useGlobalSearchData(
  query: string,
  from: number,
  size: number,
  onSuccess: (queryResponse: any) => void,
  nexus: NexusClient
) {
  const [result, setResult] = React.useState<any>({});
  const [config, setConfig] = React.useState<SearchConfig>();
  const defaultFilter: FilterState[] = [];
  const [filterState, dispatchFilter] = React.useReducer(
    filterReducer,
    defaultFilter
  );

  const filteredFields = filterState.map(el => extractFieldName(el.filterTerm));

  const [fieldsVisibility, setFieldsVisibility] = React.useState<
    ColumnVisibility[]
  >([]);

  const updateFieldsVisibility = (field: ColumnVisibility) => {
    setFieldsVisibility(
      Object.assign([], fieldsVisibility, {
        [fieldsVisibility.findIndex(el => el.key === field.key)]: field,
      })
    );
  };

  const updateAllColumnsToVisible = () => {
    setFieldsVisibility(
      fieldsVisibility.map(el => {
        return { key: el.key, name: el.name, visible: true };
      })
    );
  };

  React.useEffect(() => {
    if (localStorage.getItem('searchColumnVisibility')) {
      const cachedColumnVisibility = JSON.parse(
        localStorage.getItem('searchColumnVisibility') as string
      ) as ColumnVisibility[];
      setFieldsVisibility(cachedColumnVisibility);
    }
  }, []);

  const onFilterSubmit = (values: FilterState) => {
    dispatchFilter({ type: 'add', payload: values });
  };

  const fieldMenu = (field: ConfigField) => {
    return (
      <>
        <Button
          onClick={() => {
            updateFieldsVisibility({
              key: field.name,
              name: field.label,
              visible: false,
            });
          }}
          type="link"
        >
          <EyeInvisibleOutlined />
          Hide column
        </Button>
        <FilterOptions
          filter={filterState.find(
            filter => extractFieldName(filter.filterTerm) === field.name
          )}
          nexusClient={nexus}
          field={field}
          onFinish={onFilterSubmit}
        />
      </>
    );
  };

  const esQuery = React.useMemo(() => {
    const baseQuery = constructQuery(query);
    const withFilter = constructFilterSet(baseQuery, filterState);
    const withPagination = addPagination(withFilter, from, size);
    return withPagination.build();
  }, [query, filterState, from, size]);

  const columns: SearchConfigField = React.useMemo(() => {
    return config
      ? makeColumnConfig(config, fieldMenu, filteredFields)
      : undefined;
  }, [config, fieldsVisibility, filteredFields]);

  const visibleColumns = React.useMemo(
    () =>
      columns &&
      columns.filter(
        col =>
          !fieldsVisibility?.find(
            colVisibility =>
              col.key === colVisibility.key && !colVisibility.visible
          )
      ),
    [columns, fieldsVisibility]
  );

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
  return {
    columns,
    data,
    dispatchFilter,
    updateFieldsVisibility,
    updateAllColumnsToVisible,
    fieldsVisibility,
    setFieldsVisibility,
    visibleColumns,
    filterState,
  };
}

export default useGlobalSearchData;
