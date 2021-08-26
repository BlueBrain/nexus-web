import {
  DownOutlined,
  EyeInvisibleOutlined,
  FunnelPlotOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import {
  constructQuery,
  constructFilterSet,
  addPagination,
  addSorting,
} from '../utils';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { Button, Divider, Tooltip } from 'antd';
import { labelOf } from '../../../shared/utils';
import FilterOptions, {
  createKeyWord,
  extractFieldName,
} from '../containers/FilterOptions';
import '../containers/SearchContainer.less';
import { SortDirection } from '../../../shared/hooks/useAccessDataForTable';
import SortMenuOptions from '../components/SortMenuOptions';

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

export type ConfigField =
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
  hasFilterApplied: boolean,
  isSorted: boolean,
  sortDirection?: SortDirection
): () => JSX.Element {
  return () => {
    return (
      <div className="column-header">
        <span>{`${field.label}`}</span>
        <Tooltip
          trigger="click"
          placement="topLeft"
          title={filterMenu(field)}
          overlayInnerStyle={{ width: '450px' }}
        >
          <div className="column-header__options">
            {isSorted && sortDirection === SortDirection.ASCENDING && (
              <SortAscendingOutlined />
            )}
            {isSorted && sortDirection === SortDirection.DESCENDING && (
              <SortDescendingOutlined />
            )}
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
  filteredFields: string[],
  sortedFields: ESSortField[]
) {
  console.log('searchConfig', searchConfig);

  return searchConfig.fields.map((field: ConfigField) => {
    const sorted = sortedFields.find(s => s.fieldName === field.name);

    return {
      title: renderColumnTitle(
        field,
        filterMenu,
        filteredFields.includes(field.name),
        !!sorted,
        sorted?.direction
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
export type ESSortField = {
  label: string;
  term: string;
  fieldName: string;
  direction: SortDirection;
};

function useGlobalSearchData(
  query: string,
  page: number,
  pageSize: number,
  onSuccess: (queryResponse: any) => void,
  onSortOptionsChanged: () => void,
  nexus: NexusClient
) {
  const [result, setResult] = React.useState<any>({});
  const [config, setConfig] = React.useState<SearchConfig>();
  const defaultFilter: FilterState[] = [];
  const [filterState, dispatchFilter] = React.useReducer(
    filterReducer,
    defaultFilter
  );

  const [sortState, setSortState] = React.useState<ESSortField[]>([]);

  const removeSortOption = (sortFieldOption: ESSortField) => {
    setSortState(sort =>
      sort.filter(s => s.fieldName !== sortFieldOption.fieldName)
    );
    onSortOptionsChanged();
  };

  const changeSortOption = (sortFieldOption: ESSortField) => {
    if (sortState.find(s => s.fieldName === sortFieldOption.fieldName)) {
      setSortState(sort =>
        sort.map(s =>
          s.fieldName === sortFieldOption.fieldName ? sortFieldOption : s
        )
      );
    } else {
      setSortState(sort => [...sort, sortFieldOption]);
    }
    onSortOptionsChanged();
  };

  const filteredFields = filterState.map(el => extractFieldName(el.filterTerm));

  const [fieldsVisibility, setFieldsVisibility] = React.useState<
    ColumnVisibility[]
  >([]);
  const [userSetFieldVisibility, setUserSetFieldVisibility] = React.useState(
    false
  );

  const updateFieldsVisibility = (field: ColumnVisibility) => {
    setFieldsVisibility(
      Object.assign([], fieldsVisibility, {
        [fieldsVisibility.findIndex(el => el.key === field.key)]: field,
      })
    );
    setUserSetFieldVisibility(true);
  };

  const updateAllColumnsToVisible = () => {
    setFieldsVisibility(
      fieldsVisibility.map(el => {
        return { key: el.key, name: el.name, visible: true };
      })
    );
    setUserSetFieldVisibility(true);
  };

  React.useEffect(() => {
    if (!userSetFieldVisibility) return;

    localStorage.setItem(
      'searchColumnVisibility',
      JSON.stringify(fieldsVisibility)
    );
  }, [fieldsVisibility, userSetFieldVisibility]);

  const [
    visibleFieldsFromStorage,
    setVisibleFieldsFromStorage,
  ] = React.useState(!!localStorage.getItem('searchColumnVisibility'));

  React.useEffect(() => {
    if (visibleFieldsFromStorage) {
      const columnVisibilities = JSON.parse(
        localStorage.getItem('searchColumnVisibility') as string
      ) as ColumnVisibility[];
      setFieldsVisibility(columnVisibilities);
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
        <SortMenuOptions
          sortField={sortState.find(s => s.fieldName === field.name)}
          onSortField={sortOption => {
            changeSortOption({
              fieldName: field.name,
              term: createKeyWord(field),
              label: field.label,
              direction: sortOption,
            });
          }}
          onRemoveSort={sortOption => removeSortOption(sortOption)}
        />
        <Divider />
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
    const withPagination = addPagination(withFilter, page, pageSize);
    const withSorting = addSorting(withPagination, sortState);
    return withSorting.build();
  }, [query, filterState, page, pageSize, sortState]);

  const columns: SearchConfigField = React.useMemo(() => {
    return config
      ? makeColumnConfig(config, fieldMenu, filteredFields, sortState)
      : undefined;
  }, [config, fieldsVisibility, filteredFields, sortState]);

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
      return result.hits.hits.map((hit: any, ix: number) => {
        return { ...hit._source, key: ix };
      });
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

  const resetColumns = () => {
    localStorage.removeItem('searchColumnVisibility');
    // TODO: reset visible columns
  };

  return {
    columns,
    data,
    dispatchFilter,
    updateFieldsVisibility,
    updateAllColumnsToVisible,
    fieldsVisibility,
    setFieldsVisibility,
    visibleFieldsFromStorage,
    visibleColumns,
    filterState,
    sortState,
    removeSortOption,
    changeSortOption,
    resetColumns,
  };
}

export default useGlobalSearchData;
