import { Resource } from '@bbp/nexus-sdk';
import { Switch } from 'antd';
import React, { useReducer, useState } from 'react';
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

export interface DataExplorerConfiguration {
  pageSize: number;
  offset: number;
  orgAndProject?: [string, string];
  type: string | undefined;
  predicateFilter: ((resource: Resource) => boolean) | null;
  selectedPath: string | null;
}

export const DataExplorer: React.FC<{}> = () => {
  const [showMetadataColumns, setShowMetadataColumns] = useState(false);

  const [
    { pageSize, offset, orgAndProject, predicateFilter, type, selectedPath },
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
      predicateFilter: null,
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

  const displayedDataSource = predicateFilter
    ? currentPageDataSource.filter(resource => {
        return predicateFilter(resource);
      })
    : currentPageDataSource;

  return (
    <div className="data-explorer-contents">
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
              predicateFilter ? displayedDataSource.length : undefined
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
          </div>
        </div>
      )}

      <DataExplorerTable
        isLoading={isLoading}
        dataSource={displayedDataSource}
        columns={columnsFromDataSource(
          currentPageDataSource,
          showMetadataColumns,
          selectedPath
        )}
        total={resources?._total}
        pageSize={pageSize}
        offset={offset}
        updateTableConfiguration={updateTableConfiguration}
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
