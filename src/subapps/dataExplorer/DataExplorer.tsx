import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { Resource } from '@bbp/nexus-sdk/es';
import { useHistory } from 'react-router';
import { matchPath } from 'react-router-dom';
import { Spin, Switch } from 'antd';
import { find, merge, unionWith } from 'lodash';
import { AntdTableRef, DataExplorerTable } from './DataExplorerTable';
import {
  columnFromPath,
  isUserColumn,
  sortColumns,
  usePaginatedExpandedResources,
} from './DataExplorerUtils';
import {
  TType,
  TTypeOperator,
} from '../../shared/molecules/TypeSelector/types';
import TypeSelector from '../../shared/molecules/TypeSelector/TypeSelector';
import { ProjectSelector } from './ProjectSelector';
import { PredicateSelector } from './PredicateSelector';
import { DatasetCount } from './DatasetCount';
import { DataExplorerCollapsibleHeader } from './DataExplorerCollapsibleHeader';
import DateExplorerScrollArrows from './DateExplorerScrollArrows';
import ColumnsSelector, { TColumn } from './ColumnsSelector';
import './styles.scss';

const $update = <T,>(
  array: T[],
  keyfn: (item: T) => void,
  newVal: Partial<T>
) => {
  const match = find(array, keyfn);
  if (match) merge(match, newVal);
  return array;
};
export interface DataExplorerConfiguration {
  pageSize: number;
  offset: number;
  orgAndProject?: [string, string];
  types?: TType[];
  frontendPredicate: ((resource: Resource) => boolean) | null;
  backendPredicateQuery: Object | null;
  selectedPath: string | null;
  deprecated: boolean;
  columns: TColumn[];
  typeOperator: TTypeOperator;
}
const SELECTED_COLUMNS_CACHED_KEY = 'data-explorer-selected-columns';
const SELECTED_FILTERS_CACHED_KEY = 'data-explorer-selected-filters';

export const updateSelectedColumnsCached = (columns: TColumn[]) => {
  sessionStorage.setItem(SELECTED_COLUMNS_CACHED_KEY, JSON.stringify(columns));
};

export const updateSelectedFiltersCached = (options: Record<string, any>) => {
  const data = JSON.parse(
    sessionStorage.getItem(SELECTED_FILTERS_CACHED_KEY) ?? '{}'
  );
  Object.keys(options).forEach(key => {
    (data as any)[key] = options[key];
  });
  sessionStorage.setItem(SELECTED_FILTERS_CACHED_KEY, JSON.stringify(data));
};

const getSelectedColumnsCached = (): TColumn[] => {
  const cached = sessionStorage.getItem(SELECTED_COLUMNS_CACHED_KEY);
  if (!cached) return [];
  try {
    return JSON.parse(cached);
  } catch (e) {
    return [];
  }
};

const getSelectedFiltersCached = () => {
  const cached = sessionStorage.getItem(SELECTED_FILTERS_CACHED_KEY);
  try {
    const parsed = JSON.parse(cached ?? '{}');
    return {
      org: parsed.org ?? undefined,
      project: parsed.project ?? undefined,
      types: parsed.types ?? undefined,
      deprecated: parsed.deprecated ?? false,
      showMetadata: parsed.showMetadata ?? false,
      showEmptyCells: parsed.showEmptyCells ?? true,
      pageSize: parsed.pageSize ?? 50,
      offset: parsed.offset ?? 0,
      typeOperator: parsed.typeOperator ?? 'OR',
    };
  } catch (e) {
    return null;
  }
};

const clearSelectedColumnsCached = () => {
  sessionStorage.removeItem(SELECTED_COLUMNS_CACHED_KEY);
};
const clearSelectedFiltersCached = () => {
  sessionStorage.removeItem(SELECTED_FILTERS_CACHED_KEY);
};

export const columnsFromDataSource = (
  resources: Resource[],
  showMetadataColumns: boolean,
  selectedPath: string | null
): string[] => {
  const columnNames = new Set<string>();

  resources.forEach(resource => {
    Object.keys(resource).forEach(key => columnNames.add(key));
  });

  if (showMetadataColumns) {
    return Array.from(columnNames).sort(sortColumns);
  }

  const selectedMetadataColumn = columnFromPath(selectedPath);
  return Array.from(columnNames)
    .filter(
      colName => isUserColumn(colName) || colName === selectedMetadataColumn
    )
    .sort(sortColumns);
};

const DataExplorer: React.FC<{}> = () => {
  const history = useHistory();
  const [showMetadataColumns, setShowMetadataColumns] = useState(false);
  const [showEmptyDataCells, setShowEmptyDataCells] = useState(true);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<AntdTableRef>(null);
  const [typeFilterFocused, setTypeFilterFocused] = useState(false);
  const handleTypeFilterFocused = (open: boolean) => setTypeFilterFocused(open);

  const [
    {
      pageSize,
      offset,
      orgAndProject,
      // NOTE: Right now, the `EXISTS` and `DOES_NOT_EXIST` predicates run on the backend and update the `backendPredicateQuery` parameter.
      // `CONTAINS` and `DOES_NOT_CONTAIN` predicates on the other hand, only run on frontend and update `frontendPredicate` parameter.
      // When we implement running all the predicates on backend, we should discard `frontendPredicate` parameter completely.
      frontendPredicate,
      backendPredicateQuery,
      types,
      selectedPath,
      deprecated,
      columns,
      typeOperator,
    },
    updateTableConfiguration,
  ] = useReducer(
    (
      previous: DataExplorerConfiguration,
      next: Partial<DataExplorerConfiguration>
    ) => ({
      ...previous,
      ...next,
    }),
    {
      pageSize: 50,
      offset: 0,
      orgAndProject: undefined,
      types: [],
      frontendPredicate: null,
      backendPredicateQuery: null,
      selectedPath: null,
      deprecated: false,
      columns: [],
      typeOperator: 'OR',
    }
  );

  const { data: resources, isLoading } = usePaginatedExpandedResources({
    pageSize,
    offset,
    orgAndProject,
    deprecated,
    typeOperator,
    types: types?.map(t => t.value),
    predicateQuery: backendPredicateQuery,
  });

  const currentPageDataSource: Resource[] = resources?._results || [];

  const displayedDataSource = frontendPredicate
    ? currentPageDataSource.filter(frontendPredicate)
    : currentPageDataSource;

  const buildColumns = useMemo(() => {
    const newColumns = columnsFromDataSource(
      currentPageDataSource,
      showMetadataColumns,
      selectedPath
    )
      .filter((t: string) => !['@type', '_project'].includes(t))
      .map(value => ({
        value,
        selected: true,
        key: `de-column-${value}`,
      }));
    const selectedColumns = getSelectedColumnsCached();
    if (selectedColumns.length > 0) {
      return unionWith(
        selectedColumns,
        newColumns,
        (a, b) => a.value === b.value
      );
    }
    return newColumns;
  }, [
    JSON.stringify(currentPageDataSource),
    selectedPath,
    showMetadataColumns,
  ]);

  useEffect(() => {
    updateTableConfiguration({ columns: buildColumns });
  }, [JSON.stringify(buildColumns)]);

  const onColumnSelect = (
    _: React.MouseEvent<HTMLElement, MouseEvent>,
    { value, selected }: TColumn
  ) => {
    const newColumns = $update<TColumn>(
      columns,
      column => column.value === value,
      { value, selected: !selected }
    );
    updateTableConfiguration({ columns: newColumns });
    updateSelectedColumnsCached(newColumns);
  };

  useEffect(() => {
    const selectedFilters = getSelectedFiltersCached();
    if (selectedFilters) {
      updateTableConfiguration({
        orgAndProject:
          selectedFilters.org && selectedFilters.project
            ? [selectedFilters.org, selectedFilters.project]
            : undefined,
        types: selectedFilters.types,
        deprecated: selectedFilters.deprecated ?? deprecated,
        typeOperator: selectedFilters.typeOperator ?? typeOperator,
      });
      setShowMetadataColumns(
        selectedFilters.showMetadata ?? showMetadataColumns
      );
      setShowEmptyDataCells(
        selectedFilters.showEmptyCells ?? showEmptyDataCells
      );
    }
  }, []);

  const onDeprecatedChange = (checked: boolean) => {
    updateTableConfiguration({
      deprecated: checked,
    });
    updateSelectedFiltersCached({ deprecated: checked });
  };

  const onShowMetadataColumnsChange = (checked: boolean) =>
    setShowMetadataColumns(checked);

  const onResetPredicateCallback = (column: string, checked: boolean) => {
    const newColumns = $update<TColumn>(columns, c => c.value === column, {
      value: column,
      selected: checked,
    });
    updateSelectedColumnsCached(newColumns);
  };

  const displayedColumns = columns
    .filter(column => column.selected)
    .map(column => column.value);

  useEffect(() => {
    const unlisten = history.listen(location => {
      // if we will not be in a resource page,
      // if we will not be in the graph flow page
      // then we clear the selected columns and filters
      // meaning: if the user navigate to a page different than a resource page/graph flow page we clear the cache
      const matchedResourcePath = matchPath(location.pathname, {
        path: '/:orgLabel/:projectLabel/resources/:resourceId',
      });
      const matchedGraphGlow =
        location.pathname === '/data-explorer/graph-flow';
      if (!matchedResourcePath && !matchedGraphGlow) {
        clearSelectedColumnsCached();
        clearSelectedFiltersCached();
      }
    });
    return () => unlisten();
  }, []);

  const shouldShowPredicateSelector = orgAndProject?.length === 2;

  return (
    <div className="data-explorer-contents" ref={containerRef}>
      {isLoading && <Spin className="loading" />}

      <DataExplorerCollapsibleHeader
        onVisibilityChange={offsetHeight => {
          setHeaderHeight(offsetHeight);
        }}
      >
        <div className="data-explorer-filters" id="data-explorer-filters">
          <div className="left">
            <ProjectSelector
              defaultValue={
                orgAndProject?.length === 2
                  ? `${orgAndProject?.[0]}/${orgAndProject?.[1]}`
                  : undefined
              }
              onSelect={(orgLabel?: string, projectLabel?: string) => {
                if (orgLabel && projectLabel) {
                  updateTableConfiguration({
                    orgAndProject: [orgLabel, projectLabel],
                  });
                  clearSelectedColumnsCached();
                  updateSelectedFiltersCached({
                    org: orgLabel,
                    project: projectLabel,
                  });
                } else {
                  updateTableConfiguration({ orgAndProject: undefined });
                  updateSelectedFiltersCached({
                    org: undefined,
                    project: undefined,
                  });
                }
              }}
            />
            <TypeSelector
              key={'data-explorer-type-selector'}
              defaultValue={types}
              org={orgAndProject?.[0]}
              project={orgAndProject?.[1]}
              types={types}
              typeOperator={typeOperator}
              updateOptions={updateTableConfiguration}
              styles={{
                container: { width: '260px' },
                selector: {
                  '--types-background-color': 'white',
                } as React.CSSProperties,
              }}
              afterUpdate={(typeOperator, types) => {
                updateTableConfiguration({ types, typeOperator });
                clearSelectedColumnsCached();
                updateSelectedFiltersCached({
                  typeOperator,
                  types: types && types.length > 0 ? types : undefined,
                });
              }}
              onVisibilityChange={handleTypeFilterFocused}
              popupContainer={() =>
                document.getElementById('data-explorer-filters')!
              }
            />
            {shouldShowPredicateSelector ? (
              <PredicateSelector
                columns={columns}
                onPredicateChange={updateTableConfiguration}
                onResetCallback={onResetPredicateCallback}
                org={orgAndProject![0]}
                project={orgAndProject![1]}
                types={types}
              />
            ) : null}
          </div>
          <div className="right">
            <ColumnsSelector
              {...{
                columns,
                onColumnSelect,
                loading: isLoading,
              }}
            />
          </div>
        </div>

        <div className="flex-container">
          <DatasetCount
            orgAndProject={orgAndProject}
            types={types}
            nexusTotal={resources?._total ?? 0}
            totalOnPage={resources?._results?.length ?? 0}
            totalFiltered={
              frontendPredicate ? displayedDataSource.length : undefined
            }
          />
          <div className="data-explorer-toggles">
            <Switch
              defaultChecked={false}
              checked={deprecated}
              onClick={onDeprecatedChange}
              id="show-deprecated-resources"
              className="data-explorer-toggle"
            />
            <label htmlFor="show-metadata-columns">Show deprecated</label>
            <Switch
              defaultChecked={false}
              checked={showMetadataColumns}
              onClick={onShowMetadataColumnsChange}
              id="show-metadata-columns"
              className="data-explorer-toggle"
            />
            <label htmlFor="show-metadata-columns">Show metadata</label>

            <Switch
              defaultChecked={true}
              checked={showEmptyDataCells}
              onClick={isChecked => setShowEmptyDataCells(isChecked)}
              id="show-empty-data-cells"
              className="data-explorer-toggle"
            />
            <label htmlFor="show-empty-data-cells">Show empty data cells</label>
          </div>
        </div>
      </DataExplorerCollapsibleHeader>
      <DataExplorerTable
        ref={tableRef}
        isLoading={isLoading}
        dataSource={displayedDataSource}
        columns={displayedColumns}
        total={resources?._total}
        pageSize={pageSize}
        offset={offset}
        updateTableConfiguration={updateTableConfiguration}
        showEmptyDataCells={showEmptyDataCells}
        tableOffsetFromTop={headerHeight}
        typeFilterFocused={typeFilterFocused}
      />
      <DateExplorerScrollArrows
        types={types}
        orgAndProject={orgAndProject}
        showEmptyDataCells={showEmptyDataCells}
        showMetadataColumns={showMetadataColumns}
        isLoading={isLoading}
        container={containerRef.current}
        table={tableRef.current}
      />
    </div>
  );
};

export default DataExplorer;
