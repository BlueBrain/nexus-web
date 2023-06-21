import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import { isObject, isString } from 'lodash';
import React, { useReducer } from 'react';
import { useQuery } from 'react-query';
import { getResourceLabel } from '../../shared/utils';
import { DataExplorerTable } from './DataExplorerTable';
import './styles.less';

export interface DataExplorerConfiguration {
  pageSize: number;
  offset: number;
}

export const DataExplorer: React.FC<{}> = () => {
  const nexus = useNexusContext();

  const [{ pageSize, offset }, updateTableConfiguration] = useReducer(
    (
      previous: DataExplorerConfiguration,
      next: Partial<DataExplorerConfiguration>
    ) => ({ ...previous, ...next }),
    { pageSize: 50, offset: 0 }
  );

  const { data: resources, isLoading } = useQuery({
    queryKey: ['data-explorer', { pageSize, offset }],
    retry: false,
    queryFn: () => {
      return nexus.Resource.list(undefined, undefined, {
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

  const dataSource: Resource[] =
    resources?._results?.map(resource => {
      return {
        ...resource,
        name: getResourceLabel(resource),
      };
    }) || [];

  return (
    <div className="container">
      <DataExplorerTable
        isLoading={isLoading}
        dataSource={dataSource}
        total={resources?._total}
        pageSize={pageSize}
        offset={offset}
        updateTableConfiguration={updateTableConfiguration}
      />
    </div>
  );
};
