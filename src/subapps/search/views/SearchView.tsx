import * as React from 'react';
import { Layout, Row, Col, Input, List, Spin, Select } from 'antd';
import useSearch from '../hooks/useSearch';
import FacetItem from '../components/FacetItem';
import ResourceCardComponent from '../../../shared/components/ResourceCard';
import { Resource } from '@bbp/nexus-sdk';
import { set } from 'lodash';

const { Header, Content, Footer, Sider } = Layout;

const { Search } = Input;
const { Option } = Select;

const SearchView: React.FC = () => {
  const [searchData, { searchProps, setSearchProps }] = useSearch();

  React.useEffect(() => {
    const facetMap = new Map();
    facetMap.set('type', {
      propertyKey: '@type',
      label: 'Type',
      type: 'terms',
      value: new Map(),
    });
    facetMap.set('Schemas', {
      propertyKey: '_constrainedBy',
      label: 'Schemas',
      type: 'terms',
      value: new Map(),
    });
    facetMap.set('Project', {
      propertyKey: '_project',
      label: 'Projecs',
      type: 'terms',
      value: new Map(),
    });
    setSearchProps({
      ...searchProps,
      pagination: {
        from: 0,
        size: 20,
      },
      facetMap,
    });
  }, []);

  const [
    selectedResource,
    setSelectedResource,
  ] = React.useState<Resource | null>(null);

  const handleClickItem = (resource: Resource) => () => {
    setSelectedResource(resource);
  };

  const handlePagniationChange = (page: number, pageSize?: number) => {
    const size = searchProps.pagination?.size || 0;
    setSearchProps({
      ...searchProps,
      pagination: {
        from: (page - 1) * size,
        size: pageSize || size,
      },
    });
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setSearchProps({
      ...searchProps,
      pagination: {
        from: searchProps.pagination?.from || 0,
        size,
      },
    });
  };

  const handleSearch = (value?: string) => {
    setSearchProps({
      ...searchProps,
      query: value,
    });
  };

  const handleFacetChanged = (aggKey: string) => (
    key: string,
    value: boolean
  ) => {
    console.log({ aggKey, key, value });

    if (value) {
      searchProps.facetMap?.get(aggKey)?.value.set(key, key);
    } else {
      searchProps.facetMap?.get(aggKey)?.value.delete(key);
    }

    setSearchProps({
      ...searchProps,
    });
  };

  console.log({ searchData });

  const total = searchData.data?.hits.total.value || 0;
  const size = searchProps.pagination?.size || 0;
  const from = searchProps.pagination?.from || 0;
  const totalPages = Math.ceil(total / size);
  const current = Math.floor((totalPages / total) * from + 1);

  console.log({ total, size, from, totalPages, current, searchProps });

  return (
    <Content style={{ padding: '1em' }}>
      <Layout>
        <Sider style={{ padding: '1em', background: 'transparent' }}>
          {searchData.data &&
            Object.keys(searchData.data?.aggregations || {}).map(aggKey => {
              if (!searchProps.facetMap) {
                return null;
              }
              searchProps.facetMap.get(aggKey);

              const facets =
                searchData.data?.aggregations[aggKey]?.buckets.map(
                  (bucket: any) => {
                    const [label] = bucket.key.split('/').reverse();
                    const selected = searchProps.facetMap
                      ?.get(aggKey)
                      ?.value.get(bucket.key);

                    console.log({ selected, key: bucket.key });
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
                  title={aggKey.toLocaleUpperCase()}
                  facets={facets}
                  onChange={handleFacetChanged(aggKey)}
                />
              );
            })}
        </Sider>
        <Content>
          <Row>
            <Col span={selectedResource ? 12 : 24}>
              <div style={{ margin: '0 0 1em 0' }}>
                <Search onSearch={handleSearch} />
              </div>
              <Spin spinning={searchData.loading}>
                <div style={{ padding: '1em' }}>
                  <div
                    className="controls"
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div
                      style={{
                        fontSize: '1.5em',
                        fontWeight: 'bold',
                        margin: '0 0 1em 0',
                      }}
                    >
                      Showing {searchData.data?.hits.hits.length} of{' '}
                      {searchData.data?.hits.total.value} Resources
                    </div>
                    <div>
                      sort by:{' '}
                      <Select defaultValue="date desc">
                        <Option value="date desc">Newest first</Option>
                        <Option value="date asc">Oldest first</Option>
                      </Select>
                    </div>
                  </div>
                  <List
                    itemLayout="horizontal"
                    grid={{ gutter: 16, column: 4 }}
                    dataSource={searchData.data?.hits.hits || []}
                    pagination={{
                      total,
                      current,
                      pageSize: size,
                      showSizeChanger: true,
                      onChange: handlePagniationChange,
                      onShowSizeChange: handlePageSizeChange,
                    }}
                    renderItem={hit => (
                      <List.Item>
                        <div
                          onClick={handleClickItem(hit._source)}
                          style={{
                            borderRadius: '4px',
                            background: 'white',
                            // height: '300px',
                            // width: '200px',
                            padding: '1em',
                          }}
                        >
                          {hit._id}
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </Spin>
            </Col>
            {!!selectedResource && (
              <Col span={12}>
                <div style={{ padding: '1em' }}>
                  <ResourceCardComponent resource={selectedResource} />
                </div>
              </Col>
            )}
          </Row>
        </Content>
      </Layout>
    </Content>
  );
};

export default SearchView;
