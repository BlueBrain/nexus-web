import * as React from 'react';
import { Layout, Row, List, Spin, Select, Card } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { Resource } from '@bbp/nexus-sdk';

import FacetItem from '../components/FacetItem';
import ResultPreviewItemContainer from '../containers/ResultPreviewItemContainer';
import useSearchConfigs from '../../../shared/hooks/useSearchConfigs';
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

import DefaultResourcePreviewCard from '!!raw-loader!../templates/DefaultResourcePreviewCard.hbs';
import './SearchView.less';

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
  const { preferedSearchConfig } = useSearchConfigs();

  const [searchResponse, { searchProps, setSearchProps }] = useSearchQuery(
    preferedSearchConfig?.view
  );
  const [queryParams, setQueryString] = useQueryString();

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

  const handleClickItem = (resource: Resource) => () => {
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

  const handlePageSizeChange = (current: number, size: number) => {
    changeSearchProps({
      ...searchProps,
      pagination: {
        size,
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

  // Pagination Props
  const total = searchResponse.data?.hits.total.value || 0;
  const size = searchProps.pagination?.size || 0;
  const from = searchProps.pagination?.from || 0;
  const totalPages = Math.ceil(total / size);
  const current = Math.floor((totalPages / total) * from + 1);
  const currentSize = searchResponse.data?.hits.hits.length;
  const shouldShowPagination = totalPages > 1;

  return (
    <Content style={{ padding: '1em' }}>
      <Layout>
        {searchResponse.data && (
          <Sider
            style={{
              width: '20%',
              minWidth: '250px',
              background: 'transparent',
              boxSizing: 'content-box',
            }}
          >
            <Card>
              {Object.keys(searchResponse.data?.aggregations || {}).map(
                aggKey => {
                  if (!searchProps.facetMap) {
                    return null;
                  }
                  searchProps.facetMap.get(aggKey);

                  const facets =
                    searchResponse.data?.aggregations[aggKey]?.buckets.map(
                      (bucket: any) => {
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
                      }
                    ) || [];
                  return (
                    <FacetItem
                      key={aggKey}
                      title={aggKey.toLocaleUpperCase()}
                      facets={facets}
                      onChange={handleFacetChanged(aggKey)}
                    />
                  );
                }
              )}
            </Card>
          </Sider>
        )}
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
            <Spin
              size="large"
              spinning={searchResponse.loading}
              wrapperClassName="results-wrapper"
            >
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
              <List
                itemLayout="horizontal"
                grid={{ gutter: 16, column: 4 }}
                dataSource={searchResponse.data?.hits.hits || []}
                pagination={
                  shouldShowPagination && {
                    total,
                    current,
                    pageSize: size,
                    showSizeChanger: true,
                    onChange: handlePagniationChange,
                    onShowSizeChange: handlePageSizeChange,
                  }
                }
                renderItem={hit => (
                  <List.Item>
                    <div
                      className="result-preview-card"
                      onClick={handleClickItem(hit._source)}
                    >
                      <ResultPreviewItemContainer
                        resource={hit._source as Resource}
                        defaultPreviewItemTemplate={DefaultResourcePreviewCard}
                      />
                    </div>
                  </List.Item>
                )}
              />
            </Spin>
          </Row>
        </Content>
      </Layout>
    </Content>
  );
};

export default SearchView;
