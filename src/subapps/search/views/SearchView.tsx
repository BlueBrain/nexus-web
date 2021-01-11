import * as React from 'react';
import { Layout, Row, Spin, Select, Card, Result, Switch } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { match } from 'ts-pattern';

import { Resource } from '@bbp/nexus-sdk';

import FacetItem from '../components/FacetItem';
import useSearchConfigs from '../../../shared/hooks/useSearchConfigs';
import ElasticSearchResultsTable from '../../../shared/components/ElasticSearchResultsTable';
import useSearchQuery, {
  DEFAULT_SEARCH_PROPS,
  parseSerializedSearchFacets,
  SerializedFacetMap,
  serializeSearchFacets,
  SortDirection,
  UseSearchProps,
} from '../../../shared/hooks/useSearchQuery';
import useQueryString from '../../../shared/hooks/useQueryString';
import ActiveFilters from '../components/ActiveFilters';
import ResultsGrid from '../components/ResultsGrid';
import useLocalStorage from '../../../shared/hooks/useLocalStorage';

import './SearchView.less';

export enum SEARCH_VIEW_TYPES {
  TABLE = 'TABLE',
  GRID = 'GRID',
}

const generateDefaultSearchFilterMap = () => {
  const facetMap = new Map();
  facetMap.set('Schemas', {
    propertyKey: '_constrainedBy',
    key: 'Schemas',
    label: 'Schemas',
    type: 'terms',
    value: new Set(),
  });
  facetMap.set('Projects', {
    propertyKey: '_project',
    key: 'Projects',
    label: 'Projects',
    type: 'terms',
    value: new Set(),
  });
  facetMap.set('Types', {
    propertyKey: '@type',
    key: 'Types',
    label: 'Types',
    type: 'terms',
    value: new Set(),
  });
  return facetMap;
};
const { Content, Sider } = Layout;

const { Option } = Select;

const SearchView: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const {
    preferedSearchConfig,
    searchConfigs,
    searchConfigProject,
  } = useSearchConfigs();

  const [searchResponse, { searchProps, setSearchProps }] = useSearchQuery(
    preferedSearchConfig?.view
  );
  const [queryParams, setQueryString] = useQueryString();

  const [searchViewType, setSearchViewType] = useLocalStorage<
    SEARCH_VIEW_TYPES
  >('SEARCH_VIEW_TYPES', SEARCH_VIEW_TYPES.GRID);

  const results = searchResponse.data;

  React.useEffect(() => {
    applyQueryParamsToSearchProps();
  }, [location.search]);

  const [
    selectedResource,
    setSelectedResource,
  ] = React.useState<Resource | null>(null);

  React.useEffect(() => {
    if (!selectedResource) {
      return;
    }
    const [projectLabel, orgLabel] = selectedResource._project
      .split('/')
      .reverse();
    goToResource(orgLabel, projectLabel, selectedResource['@id']);
  }, [selectedResource]);

  const applyQueryParamsToSearchProps = () => {
    const facetMap = queryParams.facetMap
      ? parseSerializedSearchFacets(
          generateDefaultSearchFilterMap(),
          queryParams.facetMap as SerializedFacetMap
        )
      : generateDefaultSearchFilterMap();
    const newProps = { ...searchProps, ...queryParams, facetMap };
    if (!queryParams.query) {
      delete newProps.query;
    }
    setSearchProps(newProps);
  };

  const changeSearchProps = ({
    query,
    pagination,
    sort,
    facetMap,
  }: UseSearchProps) => {
    setQueryString({
      query,
      pagination,
      sort,
      facetMap: serializeSearchFacets(facetMap),
    });
  };

  const handleClickItem = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const handlePagniationChange = (page: number, pageSize?: number) => {
    const size = searchProps.pagination?.size || 0;
    changeSearchProps({
      ...searchProps,
      pagination: {
        from: (page - 1) * size,
        size: pageSize || size,
      },
    });
  };

  const handlePageSizeChange = (size: string) => {
    changeSearchProps({
      ...searchProps,
      pagination: {
        size: Number(size),
        from: searchProps.pagination?.from || 0,
      },
    });
  };

  const handleFacetChanged = (aggKey: string) => (
    key: string,
    value: boolean
  ) => {
    if (value) {
      searchProps.facetMap?.get(aggKey)?.value.add(key);
    } else {
      searchProps.facetMap?.get(aggKey)?.value.delete(key);
    }

    changeSearchProps({
      ...searchProps,
      pagination: DEFAULT_SEARCH_PROPS.pagination,
    });
  };

  const handleSortChange = (value: string) => {
    const [key, direction] = value.split('-');
    changeSearchProps({
      ...searchProps,
      sort: {
        key,
        direction: direction as SortDirection,
      },
    });
  };

  const makeResourceUri = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    return `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToResource = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    const newURL = makeResourceUri(orgLabel, projectLabel, resourceId);

    history.push(newURL, {
      background: location,
    });
  };

  const handleClearFilters = () => {
    changeSearchProps(DEFAULT_SEARCH_PROPS);
  };

  const handleClearQuery = () => {
    changeSearchProps({
      ...searchProps,
      query: undefined,
    });
  };

  const handleClearFacet = (key: string, value: string) => {
    searchProps.facetMap?.get(key)?.value.delete(value);
    changeSearchProps({
      ...searchProps,
    });
  };

  const handleSearchViewSwitchChanged = (value: boolean) => {
    setSearchViewType(value ? SEARCH_VIEW_TYPES.GRID : SEARCH_VIEW_TYPES.TABLE);
  };

  // Pagination Props
  const total = searchResponse.data?.hits.total.value || 0;
  const size = searchProps.pagination?.size || 0;
  const from = searchProps.pagination?.from || 0;
  const totalPages = Math.ceil(total / size);
  const current = Math.floor((totalPages / total) * from + 1);
  const currentSize = searchResponse.data?.hits.hits.length;
  const shouldShowPagination = totalPages > 1;

  if (searchConfigs.data?.length === 0 && !searchConfigs.isFetching) {
    return (
      <Content
        style={{
          padding: '1em',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '60%',
        }}
      >
        <Result
          title={
            <>
              <h2>
                No Search Config found in project <b>{searchConfigProject}</b>
              </h2>
              <p>
                Ask your administrator to set up a configuration in order to
                enable this feature
              </p>
            </>
          }
        ></Result>
      </Content>
    );
  }

  return (
    <Content style={{ padding: '1em' }}>
      <Layout>
        <Sider
          width={280}
          style={{
            background: 'transparent',
          }}
        >
          <Card>
            <h2 style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Filter</span> <Spin spinning={searchResponse.loading} />
            </h2>
            {Object.keys(results?.aggregations || {}).map(aggKey => {
              if (!searchProps.facetMap) {
                return null;
              }
              searchProps.facetMap.get(aggKey);

              const facets =
                results?.aggregations[aggKey]?.buckets.map((bucket: any) => {
                  const [label] = bucket.key.split('/').reverse();
                  const selected = searchProps.facetMap
                    ?.get(aggKey)
                    ?.value.has(bucket.key);

                  return {
                    label,
                    selected,
                    count: bucket.doc_count,
                    key: bucket.key,
                  };
                }) || [];
              return (
                <FacetItem
                  key={aggKey}
                  title={aggKey.toLocaleUpperCase()}
                  facets={facets}
                  onChange={handleFacetChanged(aggKey)}
                />
              );
            })}
          </Card>
        </Sider>
        <Content>
          <Row style={{ padding: '0 1em' }}>
            <ActiveFilters
              searchProps={searchProps}
              onClearQuery={handleClearQuery}
              onClearFacet={handleClearFacet}
              onClear={handleClearFilters}
            />
          </Row>
          <Row>
            <div className="results-wrapper">
              <div
                className="controls"
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <div
                  style={{
                    margin: '0 0 1em 0',
                  }}
                >
                  {!!total ? (
                    <span>
                      <b>
                        Showing {currentSize} of {total} Resources
                      </b>
                    </span>
                  ) : (
                    <span>
                      <b>No Resources found</b>
                    </span>
                  )}
                </div>
                <div
                  style={{
                    width: '30%',
                    minWidth: '600px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <div>
                    <b>Layout</b>{' '}
                    <Switch
                      checked={searchViewType === SEARCH_VIEW_TYPES.GRID}
                      onChange={handleSearchViewSwitchChanged}
                      size={'small'}
                    />{' '}
                    {searchViewType === SEARCH_VIEW_TYPES.GRID
                      ? 'Grid layout'
                      : 'Table layout'}
                  </div>
                  {'  '}
                  <div>
                    <b>Results / page </b>
                    <Select
                      defaultValue={(
                        searchProps.pagination?.size ||
                        DEFAULT_SEARCH_PROPS.pagination.size
                      ).toString()}
                      onChange={handlePageSizeChange}
                      bordered={false}
                    >
                      {['10', '20', '50', '100'].map(numResultsPerPage => (
                        <Option value={numResultsPerPage}>
                          {numResultsPerPage} / page
                        </Option>
                      ))}
                    </Select>
                  </div>
                  {'  '}
                  <div>
                    <b>Sort by </b>
                    <Select
                      defaultValue="_updatedAt-desc"
                      onChange={handleSortChange}
                      bordered={false}
                    >
                      <Option value="_createdAt-desc">Newest first</Option>
                      <Option value="_createdAt-asc">Oldest first</Option>
                      <Option value="_updatedAt-desc">Last updated</Option>
                    </Select>
                  </div>
                </div>
              </div>
              {match(searchViewType)
                .with(SEARCH_VIEW_TYPES.GRID, () => (
                  <ResultsGrid
                    searchResponse={searchResponse}
                    onClickItem={handleClickItem}
                    pagination={
                      shouldShowPagination && {
                        total,
                        current,
                        pageSize: size,
                        showSizeChanger: false,
                        onChange: handlePagniationChange,
                      }
                    }
                  />
                ))
                .with(SEARCH_VIEW_TYPES.TABLE, () => (
                  <ElasticSearchResultsTable
                    searchResponse={searchResponse}
                    onClickItem={handleClickItem}
                    pagination={
                      shouldShowPagination
                        ? {
                            total,
                            current,
                            pageSize: size,
                            showSizeChanger: false,
                            onChange: handlePagniationChange,
                          }
                        : {}
                    }
                  />
                ))
                .run()}
            </div>
          </Row>
        </Content>
      </Layout>
    </Content>
  );
};

export default SearchView;
