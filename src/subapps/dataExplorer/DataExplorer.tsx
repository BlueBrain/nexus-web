import { Resource } from '@bbp/nexus-sdk';
import { Switch } from 'antd';
import React, { useMemo, useReducer, useState } from 'react';
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
import './styles.less';
import { CollapsibleOnScroll } from './CollapsibleOnScroll';

export interface DataExplorerConfiguration {
  pageSize: number;
  offset: number;
  orgAndProject?: [string, string];
  type: string | undefined;
  predicate: ((resource: Resource) => boolean) | null;
  selectedPath: string | null;
}

export const DataExplorer: React.FC<{}> = () => {
  const [showMetadataColumns, setShowMetadataColumns] = useState(false);
  const [showEmptyDataCells, setShowEmptyDataCells] = useState(true);

  const [
    { pageSize, offset, orgAndProject, predicate, type, selectedPath },
    updateTableConfiguration,
  ] = useReducer(
    (
      previous: DataExplorerConfiguration,
      next: Partial<DataExplorerConfiguration>
    ) => ({ ...previous, ...next }),
    {
      pageSize: 50,
      offset: 0,
      orgAndProject: undefined,
      type: undefined,
      predicate: null,
      selectedPath: null,
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

  const memoizedColumns = useMemo(
    () =>
      columnsFromDataSource(
        currentPageDataSource,
        showMetadataColumns,
        selectedPath
      ),
    [currentPageDataSource, showMetadataColumns, selectedPath]
  );

  const [fromTop, setFromTop] = useState(0);
  return (
    <div className="data-explorer-contents">
      <CollapsibleOnScroll onHidden={() => setFromTop(200)}>
        <div className="data-explorer-header">
          <div className="data-explorer-filters">
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
          {!isLoading && (
            <div className="flex-container">
              <DatasetCount
                nexusTotal={resources?._total ?? 0}
                totalOnPage={resources?._results?.length ?? 0}
                totalFiltered={
                  predicate ? displayedDataSource.length : undefined
                }
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
                <label htmlFor="show-empty-data-cells">
                  Show empty data cells
                </label>
              </div>
            </div>
          )}
        </div>
      </CollapsibleOnScroll>

      <DataExplorerTable
        isLoading={isLoading}
        dataSource={displayedDataSource}
        columns={memoizedColumns}
        total={resources?._total}
        pageSize={pageSize}
        offset={offset}
        updateTableConfiguration={updateTableConfiguration}
        showEmptyDataCells={showEmptyDataCells}
        fromTop={fromTop}
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
