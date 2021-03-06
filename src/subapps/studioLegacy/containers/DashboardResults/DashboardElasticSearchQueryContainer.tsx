import { ElasticSearchView, Resource } from '@bbp/nexus-sdk';
import * as React from 'react';
import ElasticSearchResultsTable, {
  DEFAULT_FIELDS,
} from '../../../../shared/components/ElasticSearchResultsTable';
import { UseSearchProps } from '../../../../shared/hooks/useSearchQuery';
import { ResultTableFields } from '../../../../shared/types/search';
import useSearchQuery from '../../../hooks/useSearchQuery';

const DashboardElasticSearchQueryContainer: React.FC<{
  fields?: ResultTableFields[];
  view: ElasticSearchView;
  dataQuery: string;
  goToStudioResource: (selfUrl: string) => void;
}> = ({ view, dataQuery, fields, goToStudioResource }) => {
  const [searchResponse, { searchProps, setSearchProps }] = useSearchQuery(
    view._self,
    JSON.parse(dataQuery)
  );

  const handleClickItem = (resource: Resource) => {
    goToStudioResource(resource._self);
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    const size = searchProps.pagination?.size || 0;
    setSearchProps({
      ...searchProps,
      pagination: {
        from: (page - 1) * size,
        size: pageSize || size,
      },
    });
  };

  const handleSort = (sort: UseSearchProps['sort']) => {
    setSearchProps({
      ...searchProps,
      sort,
    });
  };

  // Pagination Props
  const total = searchResponse.data?.hits.total.value || 0;
  const size = searchProps.pagination?.size || 0;
  const from = searchProps.pagination?.from || 0;
  const totalPages = Math.ceil(total / size);
  const current = Math.floor((totalPages / total) * from + 1);
  const shouldShowPagination = totalPages > 1;

  return (
    <ElasticSearchResultsTable
      isStudio={true}
      fields={fields || DEFAULT_FIELDS}
      searchResponse={searchResponse}
      onClickItem={handleClickItem}
      onSort={handleSort}
      pagination={
        shouldShowPagination
          ? {
              total,
              current,
              pageSize: size,
              showSizeChanger: false,
              onChange: handlePaginationChange,
            }
          : {}
      }
    />
  );
};

export default DashboardElasticSearchQueryContainer;
