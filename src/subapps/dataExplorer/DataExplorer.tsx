import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import { isString } from 'lodash';
import React, { useReducer } from 'react';
import { useQuery } from 'react-query';
import { DataExplorerTable } from './DataExplorerTable';
import './styles.less';
import { ProjectSelector } from './ProjectSelector';
import { PredicateSelector } from './PredicateSelector';
import { DatasetCount } from './DatasetCount';
import { TypeSelector } from './TypeSelector';

export interface DataExplorerConfiguration {
  pageSize: number;
  offset: number;
  orgAndProject?: [string, string];
  type: string | undefined;
  predicateFilter: ((resource: Resource) => boolean) | null;
}

export const DataExplorer: React.FC<{}> = () => {
  const nexus = useNexusContext();

  const [
    { pageSize, offset, orgAndProject, predicateFilter, type },
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
    }
  );

  const { data: resources, isLoading } = useQuery({
    queryKey: ['data-explorer', { pageSize, offset, orgAndProject, type }],
    retry: false,
    queryFn: () => {
      return nexus.Resource.list(orgAndProject?.[0], orgAndProject?.[1], {
        type,
        from: offset,
        size: pageSize,
      });
    },
    onError: error => {
      notification.error({
        message: 'Error loading data from the server',
        description: isString(error) ? (
          error
        ) : isObject(error) ? (
          <div>
            <strong>{(error as any)['@type']}</strong>
            <div>{(error as any)['details']}</div>
          </div>
        ) : (
          ''
        ),
      });
    },
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
        <DatasetCount
          nexusTotal={resources?._total ?? 0}
          totalOnPage={resources?._results?.length ?? 0}
          totalFiltered={
            predicateFilter ? displayedDataSource.length : undefined
          }
        />
      )}

      <DataExplorerTable
        isLoading={isLoading}
        dataSource={displayedDataSource}
        columns={columnsFromDataSource(currentPageDataSource)}
        total={resources?._total}
        pageSize={pageSize}
        offset={offset}
        updateTableConfiguration={updateTableConfiguration}
      />
    </div>
  );
};

export const isObject = (value: any) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const columnsFromDataSource = (resources: Resource[]): string[] => {
  const columnNames = new Set<string>();

  resources.forEach(resource => {
    Object.keys(resource).forEach(key => columnNames.add(key));
  });

  return Array.from(columnNames);
};
