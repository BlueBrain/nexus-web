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

function fieldVisibilityReducer(
  state: FieldsVisibilityState,
  action: fieldVisibilityActionType
): FieldsVisibilityState {
  switch (action.type) {
    case 'initialize':
      return {
        isPersistent: false,
        fields: action.payload,
      };
    case 'reOrder':
      return {
        isPersistent: true,
        fields: action.payload,
      };
    case 'setAllVisible':
      console.log(state.fields);
      const fieldsAllVisibile = state.fields.map(el => {
        return {
          key: el.key,
          name: el.name,
          visible: true,
        };
      });
      return {
        isPersistent: true,
        fields: fieldsAllVisibile,
      };
    case 'update':
      const updatedFields = Object.assign([], state.fields, {
        [state.fields.findIndex(
          el => el.key === action.payload.key
        )]: action.payload,
      });
      return { isPersistent: true, fields: updatedFields };
  }
}

export type FieldVisibility = {
  key: string;
  name: string;
  visible: boolean;
};

export type FieldsVisibilityState = {
  isPersistent: boolean;
  fields: FieldVisibility[];
};

type fieldVisibilityInitializeActionType = {
  type: 'initialize';
  payload: FieldVisibility[];
};

type fieldVisibilityReOrderType = {
  type: 'reOrder';
  payload: FieldVisibility[];
};

type fieldVisibilityUpdateActionType = {
  type: 'update';
  payload: FieldVisibility;
};
type fieldVisibilitySetAllVisibleActionType = {
  type: 'setAllVisible';
};
export type fieldVisibilityActionType =
  | fieldVisibilityInitializeActionType
  | fieldVisibilityReOrderType
  | fieldVisibilityUpdateActionType
  | fieldVisibilitySetAllVisibleActionType;

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
          placement="bottomLeft"
          title={filterMenu(field)}
          overlayInnerStyle={{ width: '450px' }}
          destroyTooltipOnHide={true}
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
      // Value may not be an array, due to bad data.
      if (Array.isArray(value)) {
        const valueArray = value as string[];
        const labels = valueArray
          .map((item: string) => {
            return labelOf(item);
          })
          .join(', ');
        return <Tooltip title={labels}>{labels}</Tooltip>;
      }
      return <Tooltip title={labelOf(value)}>{labelOf(value)}</Tooltip>;
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

  const fieldVisibilityInitialState = React.useMemo(() => {
    const fieldVisibilityFromStorage = localStorage.getItem(
      'search-field-visibility'
    );
    if (!!fieldVisibilityFromStorage) {
      return {
        isPersistent: true,
        fields: JSON.parse(fieldVisibilityFromStorage),
      };
    }
    return {
      isPersistent: false,
      fields: [],
    };
  }, []);

  const [fieldsVisibilityState, dispatchFieldVisibility] = React.useReducer(
    fieldVisibilityReducer,
    fieldVisibilityInitialState
  );

  const onFilterSubmit = (values: FilterState) => {
    dispatchFilter({ type: 'add', payload: values });
    onSortOptionsChanged();
  };

  const hasKeywordFormatField = (field: ConfigField) => {
    if (field.format && field.format.includes('keyword')) return true;
    if (
      (field.fields && field.fields.find(f => f.format.includes('keyword'))) ||
      field.name === '@type'
    ) {
      return true;
    }
    return false;
  };

  const fieldMenu = (field: ConfigField) => {
    return (
      <>
        <Button
          onClick={() => {
            dispatchFieldVisibility({
              type: 'update',
              payload: {
                key: field.name,
                name: field.label,
                visible: false,
              },
            });
          }}
          type="link"
        >
          <EyeInvisibleOutlined />
          Hide column
        </Button>
        {hasKeywordFormatField(field) && (
          <>
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
              filter={filterState.filter(
                filter => extractFieldName(filter.filterTerm) === field.name
              )}
              query={query}
              nexusClient={nexus}
              field={field}
              onFinish={onFilterSubmit}
            />
          </>
        )}
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
  }, [config, fieldsVisibilityState, filteredFields, sortState]);

  const visibleColumns = React.useMemo(
    () =>
      columns &&
      columns
        .filter(
          col =>
            !fieldsVisibilityState?.fields.find(
              colVisibility =>
                col.key === colVisibility.key && !colVisibility.visible
            )
        )
        .sort((a, b) => {
          if (fieldsVisibilityState && fieldsVisibilityState.fields) {
            const fileds = fieldsVisibilityState.fields;
            const aIndex = fileds.findIndex(f => f.key === a.key);
            const bIndex = fileds.findIndex(f => f.key === b.key);
            return aIndex - bIndex;
          }
          return 0;
        }), // sort by the order of the columns
    [columns, fieldsVisibilityState]
  );

  React.useEffect(() => {
    if (fieldsVisibilityState.isPersistent) {
      localStorage.setItem(
        'search-field-visibility',
        JSON.stringify(fieldsVisibilityState.fields)
      );
    } else {
      localStorage.removeItem('search-field-visibility');
    }
  }, [fieldsVisibilityState]);

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

  const clearAllFilters = () => {
    filterState.forEach(filter => {
      dispatchFilter({ type: 'remove', payload: filter });
    });
  };

  const clearSort = () => {
    sortState.forEach(sort => {
      removeSortOption(sort);
    });
  };

  const resetAll = () => {
    clearAllFilters();
    clearSort();
  };

  return {
    columns,
    data,
    dispatchFilter,
    fieldsVisibilityState,
    visibleColumns,
    filterState,
    sortState,
    removeSortOption,
    changeSortOption,
    resetAll,
    dispatchFieldVisibility,
  };
}

export default useGlobalSearchData;
