import '../containers/SearchContainer.scss';

import {
  CaretDownOutlined,
  EyeInvisibleOutlined,
  FunnelPlotOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { NexusClient } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus/es';
import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { useQueries } from 'react-query';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';

import { SortDirection } from '../../../shared/hooks/useAccessDataForTable';
import { RootState } from '../../../shared/store/reducers';
import { deltaUrlToFusionUrl, labelOf } from '../../../shared/utils';
import SortMenuOptions from '../components/SortMenuOptions';
import DateFilterOptions from '../containers/DateFilterOptions';
import FilterOptions, {
  createKeyWord,
  extractFieldName,
} from '../containers/FilterOptions';
import NumberFilterOptions from '../containers/NumberFilterOptions';
import {
  addPagination,
  addSorting,
  constructFilterSet,
  constructQuery,
} from '../utils';

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
            <CaretDownOutlined style={{ color: '#888' }} />
          </div>
        </Tooltip>
      </div>
    );
  };
}

function rowRenderer(field: ConfigField, basePath: string) {
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
        const sanitizedLink = deltaUrlToFusionUrl(link, basePath);
        const labels = [value[fields[1].name]].flat().sort();

        return (
          <Tooltip
            placement="topLeft"
            title={() =>
              labels.map((label, ix) => (
                <div key={ix}>
                  <a href={sanitizedLink} target="_blank" rel="noreferrer">
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
  sortedFields: ESSortField[],
  basePath: string
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
      render: rowRenderer(field, basePath),
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
const fetchNexusSearchConfig = async ({ nexus }: { nexus: NexusClient }) => {
  try {
    const response = await nexus.Search.config();
    const searchConfig = response as SearchConfig;
    return searchConfig;
  } catch (error) {
    return error;
  }
};
const fetchNexusSearchQuery = async ({
  nexus,
  esQuery,
}: {
  nexus: NexusClient;
  esQuery: any;
}) => {
  try {
    const queryResponse = await nexus.Search.query(esQuery);
    return queryResponse;
  } catch (error) {
    return error;
  }
};
type TGlobalSearch = {
  query: string;
  page: number;
  pageSize: number;
  queryLayout: string;
  onSuccess: (queryResponse: any) => void;
  onSortOptionsChanged: () => void;
};
function useGlobalSearchData({
  query,
  page,
  pageSize,
  queryLayout,
  onSuccess,
  onSortOptionsChanged,
}: TGlobalSearch) {
  const history = useHistory();
  const location = useLocation();
  const nexus = useNexusContext();
  const defaultFilter: FilterState[] = [];
  const basePath =
    useSelector((state: RootState) => state.config.basePath) || '';
  const [filterState, dispatchFilter] = React.useReducer(
    filterReducer,
    defaultFilter
  );
  const [selectedSearchLayout, setSelectedSearchLayout] = React.useState<
    string
  >(() => queryLayout);

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
    if (fieldVisibilityFromStorage) {
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

  const checkDisabled = (field: ConfigField) => {
    const res = filtersWithMissing.find(
      f => f.filterTerm === field.name && f.isMissing
    );
    return !!res;
  };
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
    return withSorting.build();
  }, [query, filterState, page, pageSize, sortState]);
  const [
    { data: searchConfig, isLoading: loadingConfig },
    { data: queryResult, isLoading: loadingQuery, error: searchError },
  ] = useQueries<[{ data: SearchConfig }, { data: any; error: Error }]>([
    {
      queryKey: ['fusion-search-config'],
      queryFn: () => nexus.Search.config(),
    },
    {
      queryKey: [
        'fusion-search-query',
        { page, pageSize, query: JSON.stringify(esQuery) },
      ],
      queryFn: () => nexus.Search.query(esQuery),
      onSuccess: (data: any) => onSuccess(data),
    },
  ]);
  const data = React.useMemo(() => {
    if (queryResult && queryResult.hits && queryResult.hits.hits) {
      return queryResult.hits.hits.map((hit: any) => {
        return { ...hit._source, key: hit._source._self };
      });
    }
    return [];
  }, [queryResult]);
  const columns: SearchConfigField = React.useMemo(() => {
    return searchConfig
      ? makeColumnConfig(
          searchConfig,
          fieldMenu,
          filteredFields,
          sortState,
          basePath
        )
      : undefined;
  }, [searchConfig, fieldsVisibilityState, filteredFields, sortState]);
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
    if (searchConfig?.layouts && searchConfig.layouts.length > 0) {
      const layout = searchConfig.layouts.find(
        l => l.name === selectedSearchLayout
      );
      layout && applyLayout(layout, columns);
      return;
    }
    clearAllFilters();
    clearSort();
  };
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
    history.replace(`${location.pathname}?layout=${layoutName}`);
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
          const field = searchConfig?.fields.find(f => f.name === sort.field);
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
          const field = searchConfig?.fields.find(f => f.name === filter.field);
          if (!field) return;
          return {
            filters: filter.values,
            filterType: mapFilterOperator(filter.operator),
            filterTerm: createKeyWord(field),
          };
        })
        .filter(filter => filter !== undefined);
      dispatchFilter({ type: 'fromLayout', payload: filters as FilterState[] });
    } else {
      dispatchFilter({ type: 'fromLayout', payload: [] });
    }
  };

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
  React.useEffect(() => {
    if (
      !(searchConfig && searchConfig.layouts && searchConfig.layouts.length > 0)
    ) {
      return;
    }
    setSelectedSearchLayout(queryLayout ?? searchConfig.layouts[0].name);
  }, [searchConfig, queryLayout]);
  React.useEffect(() => {
    const layout = searchConfig?.layouts.find(
      l => l.name === selectedSearchLayout
    );
    if (!layout) return;

    applyLayout(layout, columns);
  }, [selectedSearchLayout]);
  React.useEffect(() => {
    const layout = searchConfig?.layouts.find(l => l.name === queryLayout);
    if (!layout) return;

    applyLayout(layout, columns);
  }, [queryLayout, searchConfig?.layouts]);

  return {
    data,
    columns,
    resetAll,
    sortState,
    filterState,
    searchError,
    dispatchFilter,
    visibleColumns,
    removeSortOption,
    changeSortOption,
    dispatchFieldVisibility,
    handleChangeSearchLayout,
    selectedSearchLayout,
    fieldsVisibilityState,
    config: searchConfig,
    isLoading: loadingQuery || loadingConfig,
  };
}

export default useGlobalSearchData;
