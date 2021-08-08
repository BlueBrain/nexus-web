import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { Layout, Table, Tooltip } from 'antd';
import * as bodybuilder from 'bodybuilder';
import { labelOf } from '../../../shared/utils';
import useQueryString from '../../../shared/hooks/useQueryString';
import './SearchView.less';
import '../../../shared/styles/search-tables.less';
import useMeasure from '../../../shared/hooks/useMeasure';
import { number } from '@storybook/addon-knobs';

const { Content } = Layout;

const GlobalSearchView: React.FC = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const [queryParams, setQueryString] = useQueryString();
  const { query } = queryParams;
  const [{ ref: wrapperHeightRef }, wrapperDOMProps] = useMeasure();
  const [{ ref: tempTableHeightRef }, tempTableDOMProps] = useMeasure();
  const [pagination, setPagination] = React.useState({
    numRowsFitOnPage: 0,
    currentPage: 1,
    totalNumberOfResults: 0,
    trueTotalNumberOfResults: 0,
    totalRowSpace: 0,
    pageSize: 0,
    pageSizeOptions: [] as string[],
  });

  // set page size from local storage if it has been set
  if (localStorage.getItem('searchPageSize')) {
    setPagination({
      ...pagination,
      pageSize: Number.parseInt(
        localStorage.getItem('searchPageSize') as string
      ),
    });
  }

  const calculateNumberOfRowsFitOnPage = () => {
    // set height tester table to visible to calculate height
    (document.getElementsByClassName(
      'heightTest'
    )[0] as HTMLElement).style.display = '';

    const whatTheDifference = document
      .getElementsByClassName('height-tester')[0]
      .getClientRects()[0];

    const searchResultsTableBodyTop = wrapperHeightRef.current
      .getElementsByTagName('tbody')[0]
      .getClientRects()[0].top;
    const searchResultsTableSingleRowHeight = wrapperHeightRef.current.getElementsByClassName(
      'ant-table-row'
    )[0].clientHeight;

    const totalRowSpace = whatTheDifference.bottom - searchResultsTableBodyTop;
    const numRowsFitOnPage = Math.floor(
      totalRowSpace / searchResultsTableSingleRowHeight
    );
    console.log('calculateNumberOfRowsFitOnPage', {
      searchResultsTableBodyTop,
      searchResultsTableSingleRowHeight,
      wrapperDOMProps,
      whatTheDifference,
    });
    // hide height tester table
    (document.getElementsByClassName(
      'heightTest'
    )[0] as HTMLElement).style.display = 'None';

    if (Number.isInteger(numRowsFitOnPage)) {
      return { totalRowSpaceInPx: totalRowSpace, numRowsFitOnPage };
    } else {
      return { totalRowSpaceInPx: totalRowSpace, numRowsFitOnPage: 0 };
    }
  };

  React.useEffect(() => {
    const {
      totalRowSpaceInPx,
      numRowsFitOnPage: numRows,
    } = calculateNumberOfRowsFitOnPage();

    if (numRows > 0) {
      setPagination({
        ...pagination,
        numRowsFitOnPage: numRows,
        totalRowSpace: totalRowSpaceInPx,
        currentPage: 1, // reset to first page
      });
    }
  }, [wrapperDOMProps.height]);

  const defaultPageSizeOptions = [10, 20, 50, 100];

  React.useEffect(() => {
    console.log('num rows fit on page changed', pagination.numRowsFitOnPage);
    if (pagination.numRowsFitOnPage > 0) {
      const sortedPageSizeOptions = [pagination.numRowsFitOnPage]
        .concat(defaultPageSizeOptions)
        .sort((a, b) => a - b)
        .map(String);

      const sortedPageSizeOptionsWithoutPotentialDupes = [
        ...new Set(sortedPageSizeOptions),
      ];
      console.log('setting pagination', {
        ...pagination,
        pageSizeOptions: sortedPageSizeOptionsWithoutPotentialDupes,
        pageSize: pagination.numRowsFitOnPage,
      });
      setPagination({
        ...pagination,
        pageSizeOptions: sortedPageSizeOptionsWithoutPotentialDupes,
        pageSize: pagination.numRowsFitOnPage,
      });
    }
  }, [pagination.numRowsFitOnPage]);

  const handlePaginationChange = (
    page: number,
    pageSize?: number | undefined
  ) => {
    setPagination({
      ...pagination,
      currentPage: page,
      pageSize: pageSize ? pageSize : pagination.pageSize,
    });
  };

  const [result, setResult] = React.useState<any>({});
  const [config, setConfig] = React.useState<SearchConfig>();

  const esQuery = React.useMemo(() => {
    console.log('construct query...', { pagination });
    if (pagination.currentPage && pagination.pageSize) {
      return constructQuery(query, pagination.currentPage, pagination.pageSize);
    } else {
      return {};
    }
  }, [
    query,
    pagination.currentPage,
    pagination.pageSize,
    pagination.numRowsFitOnPage,
  ]);

  const columns = React.useMemo(() => {
    return config ? makeColumnConfig(config) : undefined;
  }, [config]);

  const onRowClick = (record: any): { onClick: () => void } => {
    return {
      onClick: () => {
        const projectLabel = record.project.label;
        const resourceId = encodeURIComponent(record['@id']);
        history.push(`/${projectLabel}/resources/${resourceId}`, {
          background: location,
        });
      },
    };
  };

  const data = React.useMemo(() => {
    if (result.hits) {
      setPagination({
        ...pagination,
        totalNumberOfResults:
          result.hits.total.value > 10000 ? 10000 : result.hits.total.value,
        trueTotalNumberOfResults: result.hits.total.value,
      });
    } else {
      setPagination({
        ...pagination,
        totalNumberOfResults: 0,
        trueTotalNumberOfResults: 0,
      });
    }

    if (result.hits && result.hits.hits) {
      return result.hits.hits.map((hit: any) => hit._source);
    }
    return [];
  }, [result]);

  React.useEffect(() => {
    nexus.Search.config().then((config: any) => {
      const searchConfig = config as SearchConfig;
      setConfig(searchConfig);
    });
  }, []);

  React.useEffect(() => {
    if (pagination.pageSize > 0 && pagination.currentPage > 0) {
      console.log('searching...');
      nexus.Search.query(esQuery).then((result: any) => {
        console.log({ result });
        setResult(result);
      });
    }
  }, [esQuery]);

  return (
    <Content
      style={{
        padding: '1em',
        marginTop: '0',
      }}
    >
      <Layout>
        <Content style={{ marginLeft: '0px', marginTop: '0' }}>
          <div
            style={{ height: 'calc(100vh - 82px)', border: '1px solid green' }}
          >
            <div
              style={{
                display: 'flex',
                height: '100%',
                border: '1px dashed orange',
              }}
            >
              <div
                className="height-tester"
                ref={wrapperHeightRef}
                style={{ margin: '0' }}
              >
                <div
                  className={'result-table heightTest'}
                  style={{ display: 'none' }}
                >
                  <Table
                    dataSource={[
                      {
                        key: '1',
                        name: 'HeightTest',
                      },
                    ]}
                    columns={[
                      {
                        title: 'Name',
                        dataIndex: 'name',
                        key: 'name',
                      },
                    ]}
                    pagination={{
                      position: ['topRight'],
                      showSizeChanger: true,
                    }}
                  ></Table>
                </div>
                <div
                  className={'result-table'}
                  style={
                    {
                      //height: wrapperDOMProps.height,
                      //overflow: 'auto',
                    }
                  }
                >
                  {pagination.currentPage > 0 &&
                    pagination.pageSizeOptions.length > 0 &&
                    pagination.pageSize > 0 && (
                      <Table
                        columns={columns}
                        dataSource={data}
                        pagination={{
                          total: pagination.totalNumberOfResults,
                          pageSize: pagination.pageSize,
                          current: pagination.currentPage,
                          onChange: handlePaginationChange,
                          position: ['topRight'],
                          showTotal: (total: number, range: [number, number]) =>
                            pagination.trueTotalNumberOfResults <= 10000 ? (
                              <>
                                Showing {total.toLocaleString('en-US')}{' '}
                                {total === 1 ? 'result' : 'results'}
                              </>
                            ) : (
                              <>
                                Showing {total.toLocaleString('en-US')} of{' '}
                                {pagination.trueTotalNumberOfResults.toLocaleString(
                                  'en-US'
                                )}{' '}
                                results
                              </>
                            ),
                          locale: { items_per_page: '' },
                          showSizeChanger: true,
                          pageSizeOptions: pagination.pageSizeOptions,
                          onShowSizeChange: (current, size) => {
                            // if (pagination.pageSize) {
                            //   if (
                            //     pagination.pageSize ===
                            //     pagination.numRowsFitOnPage
                            //   ) {
                            //     localStorage.removeItem('searchPageSize');
                            //   } else {
                            //     localStorage.setItem(
                            //       'searchPageSize',
                            //       size.toString()
                            //     );
                            //   }
                            // }
                          },
                          responsive: true, // what does this do?
                          showLessItems: true,
                        }}
                        onRow={onRowClick}
                      ></Table>
                    )}
                </div>
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </Content>
  );
};

export default GlobalSearchView;

type SearchConfig = {
  fields: (
    | {
        name: string;
        label: string;
        array: boolean;
        fields: { name: string; format: string }[];
        format?: undefined;
      }
    | {
        name: string;
        label: string;
        format: string;
        array: boolean;
        fields?: undefined;
      }
  )[];
};

function makeColumnConfig(searchConfig: SearchConfig) {
  return searchConfig.fields.map((field: any) => {
    return {
      title: field.label,
      dataIndex: field.name,
      key: field.name,
      render: (value: any | any[]) => {
        // cases :
        // 1. value is text.
        // 2. value is an array of text.
        // 3. value is a link.
        // 4. value is an array of links.
        if (field.array) {
          if (field.fields) {
            const fields = field.fields as any[];
            return (
              <div>
                {value
                  ? value.map((item: any) => item[fields[1].name]).join(', ')
                  : ''}
              </div>
            );
          }
          const valueArray = value as string[];
          const labels = valueArray
            .map((item: string) => {
              return labelOf(item);
            })
            .join(', ');
          return <Tooltip title={labels}>{labels}</Tooltip>;
        }

        // Single link
        if (field.fields) {
          if (value) {
            const fields = field.fields as any[];
            const link = value[fields[0].name];
            const text = value[fields[1].name];
            return (
              <Tooltip
                placement="topLeft"
                title={() => (
                  <a href={link} target="_blank">
                    {text}
                  </a>
                )}
              >
                {text}
              </Tooltip>
            );
          }
          return '';
        }

        // Single value
        return (
          <Tooltip placement="topLeft" title={value}>
            {value}
          </Tooltip>
        );
      },
    };
  });
}

const constructQuery = (searchText: string, page: number, pageSize: number) => {
  const from = (page - 1) * pageSize;

  const body = bodybuilder();
  body
    .query('multi_match', {
      query: searchText,
      fuzziness: 5,
      prefix_length: 0,
      fields: ['*'],
    })
    .rawOption('track_total_hits', true) // accurate total
    .size(pageSize)
    .from(from);

  return body.build();
};
