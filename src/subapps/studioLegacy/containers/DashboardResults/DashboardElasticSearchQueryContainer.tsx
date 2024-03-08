import { ElasticSearchView, Resource } from '@bbp/nexus-sdk/es';
import { Empty } from 'antd';
import * as React from 'react';
import ElasticSearchResultsTable, {
  DEFAULT_FIELDS,
} from '../../../../shared/components/ElasticSearchResultsTable';
import { UseSearchProps } from '../../../../shared/hooks/useSearchQuery';
import { ResultTableFields } from '../../../../shared/types/search';
import useSearchQueryFromStudio from '../../hooks/useSearchQuery';

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

  const [paginationState, setPaginationState] = React.useState<{
    from: number;
    size: number;
  }>({
    from: 0,
    size: 20,
  });

  const [
    searchResponse,
    { searchProps, setSearchProps },
  ] = useSearchQueryFromStudio(
    view._self,
    queryJSON,
    paginationState.from,
    paginationState.size
  );

  const renderResults = React.useMemo(
    () => () => {
      const handleClickItem = (resource: Resource) => {
        goToStudioResource(resource._self);
      };

      const handlePaginationChange = (page: number, pageSize?: number) => {
        setPaginationState({
          from: page,
          size: pageSize || 20,
        });
      };

      const handleSort = (sort: UseSearchProps['sort']) => {
        setSearchProps({
          ...searchProps,
          sort,
        });
      };

      const [shouldShowPagination, paginationProp] = React.useMemo(() => {
        // Pagination Props
        const total = searchResponse.data?.hits.total.value || 0;
        const size = paginationState.size;
        const totalPages = Math.ceil(total / size);
        const current = paginationState.from;
        const shouldShowPagination = totalPages || 0 > 1;
        return [
          shouldShowPagination,
          {
            total,
            current,
            pageSize: size,
            showSizeChanger: false,
            onChange: handlePaginationChange,
          },
        ];
      }, [paginationState, searchResponse]);

      return (
        <ElasticSearchResultsTable
          isStudio={true}
          fields={fields || DEFAULT_FIELDS}
          searchResponse={searchResponse}
          onClickItem={handleClickItem}
          onSort={handleSort}
          pagination={shouldShowPagination ? paginationProp : {}}
        />
      );
    },
    [searchResponse]
  );

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
