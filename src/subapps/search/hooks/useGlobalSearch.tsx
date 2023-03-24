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
import { useSelector } from 'react-redux';
import { RootState } from '../../../shared/store/reducers';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { Button, Tooltip } from 'antd';
import { deltaUrlToFusionUrl, labelOf } from '../../../shared/utils';
import FilterOptions, {
  createKeyWord,
  extractFieldName,
} from '../containers/FilterOptions';
import DateFilterOptions from '../containers/DateFilterOptions';
import NumberFilterOptions from '../containers/NumberFilterOptions';
import '../containers/SearchContainer.less';
import { SortDirection } from '../../../shared/hooks/useAccessDataForTable';
import SortMenuOptions from '../components/SortMenuOptions';
import { useHistory, useLocation } from 'react-router';

export type SearchConfigField =
  | {
      title: () => JSX.Element;
      dataIndex: string;
      key: string;
      render: (value: any) => JSX.Element | '';
      label: string;
    }[]
  | undefined;

type actionType =
  | {
      type: 'add' | 'remove';
      payload: FilterState;
    }
  | { type: 'fromLayout'; payload: FilterState[] };

export type FilterState = {
  filters: string[];
  filterType: 'anyof' | 'allof' | 'date' | 'missing';
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
    case 'fromLayout':
      return action.payload;
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
    case 'fromLayout':
      return {
        isPersistent: true,
        fields: action.payload,
      };
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
type fieldVisibilityFromLayout = {
  type: 'fromLayout';
  payload: FieldVisibility[];
};
export type fieldVisibilityActionType =
  | fieldVisibilityInitializeActionType
  | fieldVisibilityReOrderType
  | fieldVisibilityUpdateActionType
  | fieldVisibilitySetAllVisibleActionType
  | fieldVisibilityFromLayout;

export type ConfigField =
  | {
      name: string;
      label: string;
      array: boolean;
      optional: boolean;
      fields: { name: string; format: string }[];
      format?: undefined;
      filterable: boolean;
      sortable: boolean;
    }
  | {
      name: string;
      label: string;
      format: string;
      array: boolean;
      optional: boolean;
      fields?: undefined;
      filterable: boolean;
      sortable: boolean;
    };

export type SearchLayout = {
  name: string;
  visibleFields: string[];
  filters: {
    field: string;
    operator:
      | 'and' // maps to allof
      | 'or' // maps to anyof
      | 'none' // maps to noneof
      | 'missing'; // map to missing.  Perhaps we should use same operator names?
    values: string[];
  }[];
  sort: { field: string; order: 'asc' | 'desc' }[];
};

export type SearchConfig = {
  fields: ConfigField[];
  layouts: SearchLayout[];
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
          overlayStyle={{ width: '350px', maxWidth: '350px' }}
          autoAdjustOverflow
          trigger="click"
          placement="bottom"
          title={filterMenu(field)}
          getTooltipContainer={node =>
            document.getElementsByClassName(
              'tooltipContainer'
            )[0] as HTMLElement
          }
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
        // Value may not be an array, due to bad data.
        const sanitizedValue = value && Array.isArray(value) ? value : [value];
        return (
          <div>
            {sanitizedValue
              .map((item: any) => (item ? item[fields[1].name] : ''))
              .join(', ')}
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
        const basePath =
          useSelector((state: RootState) => state.config.basePath) || '';
        const sanitizedLink = deltaUrlToFusionUrl(link, basePath);
        const labels = [value[fields[1].name]].flat().sort();

        return (
          <Tooltip
            placement="topLeft"
            title={() =>
              labels.map((label, ix) => (
                <div key={ix}>
                  <a href={sanitizedLink} target="_blank">
                    {label}
                  </a>
                </div>
              ))
            }
          >
            {labels.join(', ')}
          </Tooltip>
        );
      }
      return '';
    }

    // Single value
    const displayValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    return (
      <Tooltip placement="topLeft" title={displayValue}>
        {displayValue}
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
  format?: string;
  
};

function useGlobalSearchData(
  query: string,
  page: number,
  pageSize: number,
  queryLayout: string,
  onSuccess: (queryResponse: any) => void,
  onSortOptionsChanged: () => void,
  nexus: NexusClient
) {
  const history = useHistory();
  const location = useLocation();
  const [searchError, setSearchError] = React.useState<Error | null>(null);
  const [result, setResult] = React.useState<any>({});
  const [config, setConfig] = React.useState<SearchConfig>();
  const defaultFilter: FilterState[] = [];
  const [filterState, dispatchFilter] = React.useReducer(
    filterReducer,
    defaultFilter
  );
  const [selectedSearchLayout, setSelectedSearchLayout] = React.useState<
    string
  >(() => queryLayout);

  React.useEffect(() => {
    if (!(config && config.layouts && config.layouts.length > 0)) return;
    // default to first search layout
    setSelectedSearchLayout(queryLayout ?? config.layouts[0].name);
  }, [config, queryLayout]);

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

  const filtersWithMissing = filterState.map(el => {
    const isMissing =
      el.filterType === 'missing' && el.filters.includes('isMissing')
        ? true
        : false;
    return { isMissing, filterTerm: el.filterTerm };
  });

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

  function checkDisabled(field: ConfigField) {
    const res = filtersWithMissing.find(
      f => f.filterTerm === field.name && f.isMissing
    );
    return !!res;
  }

  const onFilterSubmit = (values: FilterState) => {
    if (values.filters.length === 0) {
      dispatchFilter({ type: 'remove', payload: values });
    } else {
      dispatchFilter({ type: 'add', payload: values });
    }

    onSortOptionsChanged();
  };

  const fieldMenu = (field: ConfigField) => {
    return (
      <div className="field-menu">
        <h1>VISIBILITY</h1>
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
        {field.sortable && (
          <>
            <h1>SORT</h1>
            <SortMenuOptions
              disabled={checkDisabled(field)}
              sortField={sortState.find(s => s.fieldName === field.name)}
              onSortField={sortOption => {
                changeSortOption({
                  fieldName: field.name,
                  term: createKeyWord(field),
                  label: field.label,
                  format: field.format,
                  direction: sortOption,
                });
              }}
              onRemoveSort={sortOption => removeSortOption(sortOption)}
            />
          </>
        )}
        {field.filterable && (
          <>
            <h1>FILTER</h1>
            {field.format?.includes('date') ? (
              <DateFilterOptions
                filter={filterState}
                query={query}
                nexusClient={nexus}
                field={field}
                onFinish={onFilterSubmit}
              />
            ) : field.fields &&
              field.fields.find(f => f.format.includes('number')) ? (
              <NumberFilterOptions
                filter={filterState}
                query={query}
                nexusClient={nexus}
                field={field}
                onFinish={onFilterSubmit}
              />
            ) : (
              <FilterOptions
                filter={filterState}
                query={query}
                nexusClient={nexus}
                field={field}
                onFinish={onFilterSubmit}
              />
            )}
          </>
        )}
      </div>
    );
  };

  const esQuery = React.useMemo(() => {
    const baseQuery = constructQuery(query);
    const withFilter = constructFilterSet(baseQuery, filterState);
    const withPagination = addPagination(withFilter, page, pageSize);
    const withSorting = addSorting(withPagination, sortState);
    console.log('€€esQuery', query, filterState);
    return withSorting.build();
  }, [query, filterState, page, pageSize, sortState]);
  const [isLoading, setIsLoading] = React.useState(false);
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
    setIsLoading(true);
    nexus.Search.config()
      .then((response: any) => {
        const searchConfig = response as SearchConfig;
        setConfig(searchConfig);
        setSearchError(null);
      })
      .catch(e => {
        setSearchError(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  React.useEffect(() => {
    setIsLoading(true);
    nexus.Search.query(esQuery)
      .then((queryResponse: any) => {
        setResult(queryResponse);
        onSuccess(queryResponse);
        setSearchError(null);
      })
      .catch(e => {
        setSearchError(e);
      })
      .finally(() => {
        setIsLoading(false);
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
    if (config?.layouts && config.layouts.length > 0) {
      const layout = config.layouts.find(l => l.name === selectedSearchLayout);
      layout && applyLayout(layout, columns);
      return;
    }
    clearAllFilters();
    clearSort();
  };

  /**
   *
   * @param operator
   * @returns Search Config Layout operator name
   */
  const mapFilterOperator = (operator: 'and' | 'or' | 'none' | 'missing') => {
    switch (operator) {
      case 'and':
        return 'allof';
      case 'or':
        return 'anyof';
      // others
      default:
        return 'and';
    }
  };

  const handleChangeSearchLayout = (layoutName: string) => {
    history.replace(
      `${location.pathname}?layout=${layoutName}`
    )
    setSelectedSearchLayout(layoutName);
  };

  const applyLayout = (layout: SearchLayout, columns: SearchConfigField) => {
    if (!columns) return;

    // visible fields and order
    dispatchFieldVisibility({
      type: 'fromLayout',
      payload: columns.map(col => ({
        name: col.label,
        key: col.key,
        visible: layout.visibleFields.includes(col.key),
      })),
    });

    // sorting
    if (layout.sort) {
      const sorting = layout.sort
        .map(sort => {
          const field = config?.fields.find(f => f.name === sort.field);
          if (!field) return;
          return {
            fieldName: field.name,
            term: createKeyWord(field),
            label: field.label,
            format: field.format,
            direction: sort.order,
          };
        })
        .filter(sort => sort !== undefined);
      sorting && setSortState(sorting as ESSortField[]);
    } else {
      setSortState([]);
    }

    // filtering
    if (layout.filters) {
      const filters = layout.filters
        .map(filter => {
          const field = config?.fields.find(f => f.name === filter.field);
          if (!field) return;
          return {
            filters: filter.values,
            filterType: mapFilterOperator(filter.operator),
            filterTerm: createKeyWord(field),
          };
        })
        .filter(filter => filter !== undefined);
        console.log('fromLayout-filters', filters)
      dispatchFilter({ type: 'fromLayout', payload: filters as FilterState[] });
    } else {
      dispatchFilter({ type: 'fromLayout', payload: [] });
    }
  };

  React.useEffect(() => {
    const layout = config?.layouts.find(l => l.name === selectedSearchLayout);
    if (!layout) return;

    applyLayout(layout, columns);
  }, [selectedSearchLayout]);
  React.useEffect(() => {
    const layout = config?.layouts.find(l => l.name === queryLayout);
    console.log('@@@@layout', config?.layouts, 'l:', layout, 'q', queryLayout);
    if (!layout) return;

    applyLayout(layout, columns);
  }, [queryLayout, config?.layouts]);

  return {
    isLoading,
    searchError,
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
    config,
    handleChangeSearchLayout,
    selectedSearchLayout,
  };
}

export default useGlobalSearchData;
