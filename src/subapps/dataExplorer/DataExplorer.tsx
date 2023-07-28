import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Spin, Switch } from 'antd';
import { find, merge, unionWith } from 'lodash';
import { DataExplorerTable } from './DataExplorerTable';
import {
  columnFromPath,
  isUserColumn,
  sortColumns,
  usePaginatedExpandedResources,
} from './DataExplorerUtils';
import { ProjectSelector } from './ProjectSelector';
import { PredicateSelector } from './PredicateSelector';
import { DatasetCount } from './DatasetCount';
import { TypeSelector } from './TypeSelector';
import ColumnsSelector, { TColumn } from './ColumnsSelector';
import { DataExplorerCollapsibleHeader } from './DataExplorerCollapsibleHeader';
import DateExplorerScrollArrows from './DateExplorerScrollArrows';

import './styles.less';

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
  type: string | undefined;
  predicate: ((resource: Resource) => boolean) | null;
  selectedPath: string | null;
  deprecated: boolean;
  columns: TColumn[];
}
const SELECTED_COLUMNS_CACHED_KEY = 'data-explorer-selected-columns';
const SELECTED_FILTERS_CACHED_KEY = 'data-explorer-selected-filters';

export const updateSelectedColumnsCached = (columns: TColumn[]) => {
  sessionStorage.setItem(SELECTED_COLUMNS_CACHED_KEY, JSON.stringify(columns));
};

export const updateSelectedFiltersCached = (
  options: Record<string, string | number | boolean | undefined>
) => {
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
      type: parsed.type ?? undefined,
      deprecated: parsed.deprecated ?? false,
      showMetadata: parsed.showMetadata ?? false,
      showEmptyCells: parsed.showEmptyCells ?? true,
      pageSize: parsed.pageSize ?? 50,
      offset: parsed.offset ?? 0,
    };
  } catch (e) {
    return null;
  }
};

const clearSelectedColumnsCached = () => {
  sessionStorage.removeItem(SELECTED_COLUMNS_CACHED_KEY);
};

export const DataExplorer: React.FC<{}> = () => {
  const [showMetadataColumns, setShowMetadataColumns] = useState(false);
  const [showEmptyDataCells, setShowEmptyDataCells] = useState(true);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [
    {
      pageSize,
      offset,
      orgAndProject,
      predicate,
      type,
      selectedPath,
      deprecated,
      columns,
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
      type: undefined,
      predicate: null,
      selectedPath: null,
      deprecated: false,
      columns: [],
    }
  );

  const { data: resources, isLoading } = usePaginatedExpandedResources({
    pageSize,
    offset,
    orgAndProject,
    type,
    deprecated,
  });

  const currentPageDataSource: Resource[] = resources?._results || [];

  const displayedDataSource = predicate
    ? currentPageDataSource.filter(predicate)
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

  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

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
        type: selectedFilters.type,
        deprecated: selectedFilters.deprecated ?? deprecated,
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

  return (
    <div className="data-explorer-contents" ref={containerRef}>
      {isLoading && <Spin className="loading" />}

      <DataExplorerCollapsibleHeader
        onVisibilityChange={offsetHeight => {
          setHeaderHeight(offsetHeight);
        }}
      >
        <div className="data-explorer-filters">
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
              defaultValue={type}
              orgAndProject={orgAndProject}
              onSelect={selectedType => {
                updateTableConfiguration({ type: selectedType });
                clearSelectedColumnsCached();
                updateSelectedFiltersCached({
                  type: selectedType,
                });
              }}
            />
            <PredicateSelector
              columns={columns}
              dataSource={currentPageDataSource}
              onPredicateChange={updateTableConfiguration}
              onResetCallback={onResetPredicateCallback}
            />
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
            type={type}
            nexusTotal={resources?._total ?? 0}
            totalOnPage={resources?._results?.length ?? 0}
            totalFiltered={predicate ? displayedDataSource.length : undefined}
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
      />
      <DateExplorerScrollArrows
        type={type}
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
