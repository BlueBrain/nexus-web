import * as React from 'react';
import {
  Layout,
  Row,
  Col,
  Input,
  List,
  Spin,
  Select,
  Collapse,
  Tag,
  Button,
} from 'antd';
import { useHistory, useLocation } from 'react-router-dom';

import FacetItem from '../components/FacetItem';
import ResourceCardComponent from '../../../shared/components/ResourceCard';
import { Resource } from '@bbp/nexus-sdk';
import { CloseCircleOutlined } from '@ant-design/icons';
import ResultPreviewItemContainer from '../containers/ResultPreviewItemContainer';
import DefaultResourcePreviewCard from '!!raw-loader!../templates/DefaultResourcePreviewCard.hbs';
import useSearchConfigs from '../../../shared/hooks/useSearchConfigs';
import useSearchQuery from '../../../shared/hooks/useSearchQuery';
import { parseURL } from '../../../shared/utils/nexusParse';

const { Header, Content, Footer, Sider } = Layout;

const { Search } = Input;
const { Option } = Select;

const SearchView: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const searchConfigStuff = useSearchConfigs();
  const [searchData, { searchProps, setSearchProps }] = useSearchQuery(
    searchConfigStuff.preferedSearchConfig?.view
  );

  React.useEffect(() => {
    const facetMap = new Map();
    facetMap.set('Types', {
      propertyKey: '@type',
      key: 'Types',
      label: 'Types',
      type: 'terms',
      value: new Set(),
    });
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
    // facetMap.set('Contrib', {
    //   propertyKey: '_createdBy',
    //   key: 'Contrib',
    //   label: 'Contrib',
    //   type: 'terms',
    //   value: new Set(),
    // });
    setSearchProps({
      ...searchProps,
      facetMap,
      pagination: {
        from: 0,
        size: 20,
      },
    });
  }, []);

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
        size,
        from: searchProps.pagination?.from || 0,
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
      searchProps.facetMap?.get(aggKey)?.value.add(key);
    } else {
      searchProps.facetMap?.get(aggKey)?.value.delete(key);
    }

    setSearchProps({
      ...searchProps,
    });
  };

  const handleSortChange = (value: string) => {
    const [key, direction] = value.split('-');
    setSearchProps({
      ...searchProps,
      sort: {
        key,
        direction: direction as 'asc' | 'desc',
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

  console.log({ searchData, searchProps });

  const suffix = () => {
    return <p>banana</p>;
  };

  // Pagination Props
  const total = searchData.data?.hits.total.value || 0;
  const size = searchProps.pagination?.size || 0;
  const from = searchProps.pagination?.from || 0;
  const totalPages = Math.ceil(total / size);
  const current = Math.floor((totalPages / total) * from + 1);

  return (
    <Content style={{ padding: '1em' }}>
      <div style={{ margin: '0 0 1em 0' }}>
        <Search
          onSearch={handleSearch}
          allowClear
          size="large"
          suffix={suffix}
        />
      </div>
      <Layout>
        {searchData.data && (
          <Sider style={{ padding: '1em', background: 'transparent' }}>
            {Object.keys(searchData.data?.aggregations || {}).map(aggKey => {
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
                      ?.value.has(bucket.key);

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
        )}
        <Content>
          <Row>
            <Col span={selectedResource ? 12 : 24}>
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
                      {!!total ? (
                        <span>
                          Showing {total} of {total} Resources
                        </span>
                      ) : (
                        <span>No Resources found</span>
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
                          className="result-preview-card"
                          onClick={handleClickItem(hit._source)}
                        >
                          <ResultPreviewItemContainer
                            resource={hit._source as Resource}
                            defaultPreviewItemTemplate={
                              DefaultResourcePreviewCard
                            }
                          />
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </Spin>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Content>
  );
};

export default SearchView;
