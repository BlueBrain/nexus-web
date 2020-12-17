import * as React from 'react';
import { Table, Tooltip } from 'antd';
import { Resource } from '@bbp/nexus-sdk';
import { TablePaginationConfig } from 'antd/lib/table';
import * as prettyBytes from 'pretty-bytes';

import { UseSearchResponse } from '../../../../shared/hooks/useSearchQuery';
import { FILE_SCHEMA } from '../../containers/ResultPreviewItemContainer';
import TypesIconList from '../../../../shared/components/Types/TypesIcon';
import { getResourceLabel } from '../../../../shared/utils';
import { convertMarkdownHandlebarStringWithData } from '../../../../shared/utils/markdownTemplate';
import { parseURL } from '../../../../shared/utils/nexusParse';

export interface ResultsGridProps {
  pagination: TablePaginationConfig;
  searchResponse: UseSearchResponse;
  onClickItem: (resource: Resource) => void;
}

const ResultsTable: React.FC<ResultsGridProps> = ({
  pagination,
  searchResponse,
  onClickItem,
}) => {
  const results = (searchResponse.data?.hits.hits || []).map(({ _source }) => {
    const { _original_source, ...everythingElse } = _source;

    const resource = {
      ...JSON.parse(_original_source),
      ...everythingElse,
    };

    return {
      ...resource,
      description: convertMarkdownHandlebarStringWithData(
        resource.description || '',
        resource
      ),
      type: (Array.isArray(resource['@type'])
        ? resource['@type']
        : [resource['@type']]
      ).map(typeURL => typeURL?.split('/').reverse()[0]),
      resourceLabel: getResourceLabel(resource),
      resourceAdminData: parseURL(resource._self),
      fileData: resource._constrainedBy === FILE_SCHEMA && {
        humanReadableFileSize: prettyBytes(resource._bytes),
      },
    };
  });

  const columns = [
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      render: (text: string, resource: Resource) => {
        return getResourceLabel(resource);
      },
    },
    {
      title: 'Project',
      dataIndex: ['resourceAdminData', 'project'],
      key: 'project',
      render: (text: string, resource: Resource) => {
        return `${resource.resourceAdminData.org} | ${resource.resourceAdminData.project}`;
      },
    },
    {
      title: 'Schema',
      dataIndex: '_constrainedBy',
      key: 'schema',
      render: (text: string, resource: Resource) => {
        return (
          <Tooltip title={resource._constrainedBy}>
            {text.split('/').reverse()[0]}
          </Tooltip>
        );
      },
    },
    {
      title: 'Types',
      dataIndex: '@type',
      key: '@type',
      render: (text: string, resource: Resource) => {
        const typeList =
          !!resource['@type'] &&
          (Array.isArray(resource['@type']) ? (
            <TypesIconList type={resource['@type']} />
          ) : (
            <TypesIconList type={[resource['@type']]} />
          ));
        return typeList;
      },
    },
  ];

  const handleClickItem = (resource: Resource) => () => {
    onClickItem(resource);
  };

  return (
    <Table
      dataSource={results}
      columns={columns}
      pagination={pagination}
      onRow={resource => {
        return {
          onClick: handleClickItem(resource),
        };
      }}
    />
  );
};

export default ResultsTable;
