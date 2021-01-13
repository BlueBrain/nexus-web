import * as React from 'react';
import { List } from 'antd';
import { ListProps } from 'antd/lib/list';
import { UseSearchResponse } from '../../../../shared/hooks/useSearchQuery';
import ResultPreviewItemContainer from '../../containers/ResultPreviewItemContainer';
import { Resource } from '@bbp/nexus-sdk';

import DefaultResourcePreviewCard from '!!raw-loader!../../templates/DefaultResourcePreviewCard.hbs';

const DEFAULT_GRID_DIMENSIONS = { gutter: 16, column: 4 };

export interface ResultsGridProps {
  pagination: ListProps<any>['pagination'];
  searchResponse: UseSearchResponse;
  onClickItem: (resource: Resource) => void;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({
  pagination,
  searchResponse,
  onClickItem,
}) => {
  const results = searchResponse.data;

  const handleClickItem = (resource: Resource) => () => {
    onClickItem(resource);
  };

  return (
    <List
      loading={searchResponse.loading}
      itemLayout="vertical"
      grid={DEFAULT_GRID_DIMENSIONS}
      dataSource={results?.hits.hits || []}
      pagination={pagination}
      renderItem={hit => {
        const { _original_source, ...resourceMetadata } = hit._source;
        const resource = {
          ...resourceMetadata,
          ...JSON.parse(_original_source),
        };
        return (
          <List.Item>
            <div
              className="result-preview-card"
              onClick={handleClickItem(resource)}
            >
              <ResultPreviewItemContainer
                resource={resource as Resource}
                defaultPreviewItemTemplate={DefaultResourcePreviewCard}
              />
            </div>
          </List.Item>
        );
      }}
    />
  );
};

export default ResultsGrid;
