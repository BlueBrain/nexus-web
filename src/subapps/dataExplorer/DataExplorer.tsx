import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Spin, Switch } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { find, merge, unionBy, orderBy } from 'lodash';
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
import { RootState } from '../../shared/store/reducers';
import { UpdateDataExplorerOrigin } from '../../shared/store/reducers/data-explorer';
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
  columns: TColumn[];
  newItemsCount: number;
  showNewItemsMessage: boolean;
}
const SELECTED_COLUMNS_CACHED_KEY = 'data-explorer-selected-columns';
const getSelectedColumnsCached = (): TColumn[] => {
  const cached = sessionStorage.getItem(SELECTED_COLUMNS_CACHED_KEY);
  if (!cached) return [];
  try {
    return JSON.parse(cached);
  } catch (e) {
    return [];
  }
};
export const updateSelectedColumnsCached = (columns: TColumn[]) => {
  sessionStorage.setItem(SELECTED_COLUMNS_CACHED_KEY, JSON.stringify(columns));
};

export const DataExplorer: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const [showMetadataColumns, setShowMetadataColumns] = useState(false);
  const [showEmptyDataCells, setShowEmptyDataCells] = useState(true);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const { origin } = useSelector((state: RootState) => state.dataExplorer);
  const history = useHistory();
  const [
    {
      pageSize,
      offset,
      orgAndProject,
      predicate,
      type,
      selectedPath,
      columns,
      showNewItemsMessage,
      newItemsCount,
    },
    updateTableConfiguration,
  ] = useReducer(
    (
      previous: DataExplorerConfiguration,
      next: Partial<DataExplorerConfiguration>
    ) => ({
      ...previous,
      ...next,
      ...(next.columns
        ? {
            newItemsCount:
              (next.columns.length || 0) > (previous.columns.length || 0)
                ? (next.columns.length || 0) - (previous.columns.length || 0)
                : 0,
            showNewItemsMessage:
              previous.columns.length !== next.columns.length,
          }
        : {}),
    }),
    {
      pageSize: 50,
      offset: 0,
      orgAndProject: undefined,
      type: undefined,
      predicate: null,
      selectedPath: null,
      columns: [],
      showNewItemsMessage: false,
      newItemsCount: 0,
    }
  );

  const { data: resources, isLoading } = usePaginatedExpandedResources({
    pageSize,
    offset,
    orgAndProject,
    type,
  });

  const currentPageDataSource: Resource[] = resources?._results || [];

  const displayedDataSource = predicate
    ? currentPageDataSource.filter(predicate)
    : currentPageDataSource;

  const onColumnSelect = (
    _: React.MouseEvent<HTMLElement, MouseEvent>,
    { value, selected }: TColumn
  ) => {
    const newColumns = $update<TColumn>(
      columns,
      column => column.value === value,
      { value, selected: !selected }
    );
    updateTableConfiguration({
      columns: newColumns,
    });
    updateSelectedColumnsCached(newColumns);
  };

  const displayedColumns = columns
    .filter(column => column.selected)
    .map(column => column.value);

  useEffect(() => {
    const newColumns = columnsFromDataSource(
      currentPageDataSource,
      showMetadataColumns,
      selectedPath
    )
      .filter(t => !['@type', '_project'].includes(t))
      .map(value => ({
        value,
        selected: true,
        key: `de-column-${value}`,
      }));
    const updatedColumns = unionBy(columns, newColumns, 'value');
    if (newColumns.length) {
      updateTableConfiguration({
        columns: updatedColumns,
      });
    }
  }, [currentPageDataSource, showMetadataColumns, selectedPath]);

  useEffect(() => {
    let timeoutId: number;
    if (showNewItemsMessage) {
      timeoutId = window.setTimeout(() => {
        updateTableConfiguration({
          showNewItemsMessage: false,
        });
        clearTimeout(timeoutId);
      }, 6000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [showNewItemsMessage]);

  useEffect(() => {
    const unlisten = history.listen(location => {
      if (origin === '/data-explorer' && location.pathname === origin) {
        updateTableConfiguration({
          columns: getSelectedColumnsCached(),
        });
      }
    });
    return () => {
      dispatch(UpdateDataExplorerOrigin(''));
      unlisten();
    };
  }, [origin]);

  return (
    <div className="data-explorer-contents">
      {isLoading && <Spin className="loading" />}

      <DataExplorerCollapsibleHeader
        onVisibilityChange={offsetHeight => {
          setHeaderHeight(offsetHeight);
        }}
      >
        <div className="data-explorer-filters">
          <div className="left">
            <ProjectSelector
              onSelect={(orgLabel?: string, projectLabel?: string) => {
                if (orgLabel && projectLabel) {
                  updateTableConfiguration({
                    orgAndProject: [orgLabel, projectLabel],
                  });
                } else {
                  updateTableConfiguration({ orgAndProject: undefined });
                }
              }}
            />
            <TypeSelector
              orgAndProject={orgAndProject}
              onSelect={selectedType => {
                updateTableConfiguration({ type: selectedType });
              }}
            />
            <PredicateSelector
              dataSource={currentPageDataSource}
              onPredicateChange={updateTableConfiguration}
            />
          </div>
          <div className="right">
            <ColumnsSelector
              {...{
                columns,
                newItemsCount,
                showNewItemsMessage,
                onColumnSelect,
                loading: isLoading,
              }}
            />
          </div>
        </div>

        <div className="flex-container">
          <DatasetCount
            nexusTotal={resources?._total ?? 0}
            totalOnPage={resources?._results?.length ?? 0}
            totalFiltered={predicate ? displayedDataSource.length : undefined}
          />
          <div className="data-explorer-toggles">
            <Switch
              defaultChecked={false}
              checked={showMetadataColumns}
              onClick={isChecked => setShowMetadataColumns(isChecked)}
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
