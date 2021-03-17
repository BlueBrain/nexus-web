import { ElasticSearchView, Resource } from '@bbp/nexus-sdk';
import { Empty } from 'antd';
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
  const queryJSON = React.useMemo(() => {
    try {
      return JSON.parse(dataQuery);
    } catch (ex) {
      return {};
    }
  }, [dataQuery]);

  const renderResults = () => {
    const [searchResponse, { searchProps, setSearchProps }] = useSearchQuery(
      view._self,
      queryJSON
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

  return (
    <>
      {Object.keys(queryJSON).length > 0 ? (
        renderResults()
      ) : (
        <Empty>
          Your query is either too broad or Your workspace is not configured for
          Elastic Search
        </Empty>
      )}
    </>
  );
};

export default DashboardElasticSearchQueryContainer;
