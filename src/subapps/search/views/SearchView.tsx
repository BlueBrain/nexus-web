import * as React from 'react';
import { Layout, Row, Col, Input, List, Spin, Select } from 'antd';
import useSearch from '../hooks/useSearch';
import FacetItem from '../components/FacetItem';
import ResourceCardComponent from '../../../shared/components/ResourceCard';
import { Resource } from '@bbp/nexus-sdk';

const { Header, Content, Footer, Sider } = Layout;

const { Search } = Input;
const { Option } = Select;

const DEFAULT_PAGE_SIZE = 50;

const SearchView: React.FC = () => {
  const searchData = useSearch();
  const [
    selectedResource,
    setSelectedResource,
  ] = React.useState<Resource | null>(null);
  console.log(searchData);
  const types =
    searchData.data?.aggregations.types.buckets.map((bucket: any) => {
      return {
        count: bucket.doc_count,
        key: bucket.key,
        label: bucket.key,
        selected: false,
      };
    }) || [];

  const handleClickItem = (resource: Resource) => () => {
    setSelectedResource(resource);
  };

  const handlePagniationChange = () => {};

  return (
    <Content style={{ padding: '1em' }}>
      <Layout>
        <Sider style={{ padding: '1em', background: 'transparent' }}>
          {searchData.data &&
            Object.keys(searchData.data?.aggregations).map(aggKey => {
              const facets =
                searchData.data?.aggregations[aggKey]?.buckets.map(
                  (bucket: any) => {
                    const [label] = bucket.key.split('/').reverse();
                    return {
                      label,
                      count: bucket.doc_count,
                      key: bucket.key,
                      selected: false,
                    };
                  }
                ) || [];
              return (
                <FacetItem title={aggKey.toLocaleUpperCase()} facets={facets} />
              );
            })}
        </Sider>
        <Content>
          <Row>
            <Col span={selectedResource ? 12 : 24}>
              <div style={{ margin: '0 0 1em 0' }}>
                <Search />
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
                      showSizeChanger: true,
                      defaultPageSize: DEFAULT_PAGE_SIZE,
                      total: searchData.data?.hits.total.value,
                      onChange: handlePagniationChange,
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
