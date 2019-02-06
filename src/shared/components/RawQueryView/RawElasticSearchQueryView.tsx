import * as React from 'react';
import { Form, Input, Button, Card, List } from 'antd';
import { executeRawElasticSearchQuery } from '../../store/actions/rawQuery';
import { RawElasticSearchQueryState } from '../../store/reducers/rawQuery';
import { connect } from 'react-redux';
import { PaginatedList, PaginationSettings } from '@bbp/nexus-sdk';
import { ElasticSearchHit } from '@bbp/nexus-sdk/lib/View/ElasticSearchView/types';

let ReactJson: any;
if (typeof window !== 'undefined') {
  ReactJson = require('react-json-view').default;
}

const DEFAULT_PAGE_SIZE = 20;

export interface RawElasticSearchQueryViewProps {
  initialQuery: string;
  fetching: boolean;
  paginationSettings: PaginationSettings;
  response: PaginatedList<ElasticSearchHit>;
  wantedOrg: string;
  wantedProject: string;
  wantedView?: string;
  executeRawQuery(
    orgName: string,
    projectName: string,
    viewID: string | undefined,
    query: string,
    paginationSettings: PaginationSettings
  ): void;
}

const TextArea = Input.TextArea;
const FormItem = Form.Item;
const ListItem = List.Item;

const RawElasticSearchQueryView: React.FunctionComponent<
  RawElasticSearchQueryViewProps
> = ({
  fetching,
  initialQuery,
  paginationSettings,
  response,
  executeRawQuery,
  wantedOrg,
  wantedProject,
  wantedView,
}): JSX.Element => {
  const formattedInitialQuery = JSON.stringify(
    JSON.parse(initialQuery),
    null,
    2
  );
  const [query, setQuery] = React.useState(formattedInitialQuery);

  const data = response.results.map(result => result._source || []);
  const total = response.total || 0;
  const { from, size } = paginationSettings;
  const totalPages = Math.floor(total / size);
  const current = Math.floor((totalPages / total) * from + 1);

  const onPaginationChange = (page: number, size?: number) => {
    const pageSize = size || DEFAULT_PAGE_SIZE;
    const from = pageSize * page;
    const paginationSettings = {
      from,
      size: pageSize,
    };
    executeRawQuery(
      wantedOrg,
      wantedProject,
      wantedView,
      query,
      paginationSettings
    );
  };

  return (
    <>
      <Form
        onSubmit={e => {
          e.preventDefault();
          executeRawQuery(
            wantedOrg,
            wantedProject,
            wantedView,
            query,
            paginationSettings
          );
        }}
      >
        <FormItem>
          <TextArea
            className="query"
            value={query}
            placeholder={`Enter a valid ElasticSearch query`}
            onChange={e => setQuery(e.target.value)}
            autosize
          />
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">
            Execute ElasticSearch query
          </Button>
        </FormItem>
      </Form>
      <Card bordered>
        <List
          bordered
          size="small"
          className="elasticsearch-results"
          itemLayout="vertical"
          loading={fetching}
          header={
            <p className="result">{`Found ${total} result${
              total > 1 ? 's' : ''
            }`}</p>
          }
          dataSource={data}
          pagination={{
            total,
            current,
            pageSize: DEFAULT_PAGE_SIZE,
            onChange: onPaginationChange,
            position: 'both',
          }}
          renderItem={(result?: object) => (
            <ListItem>
              {(result && (
                <ReactJson
                  src={result}
                  name={null}
                  enableClipboard={false}
                  displayObjectSize={false}
                  displayDataTypes={false}
                />
              )) ||
                ''}
            </ListItem>
          )}
        />
      </Card>
    </>
  );
};

const mapStateToProps = (
  {
    rawElasticSearchQuery,
  }: {
    rawElasticSearchQuery: RawElasticSearchQueryState;
  },
  ownProps: any
) => ({
  fetching: rawElasticSearchQuery.fetching,
  initialQuery:
    ownProps.initialQuery ||
    JSON.stringify(
      {
        query: {
          term: {
            _deprecated: false,
          },
        },
      },
      null,
      2
    ),
  paginationSettings: rawElasticSearchQuery.paginationSettings || {
    from: 0,
    size: DEFAULT_PAGE_SIZE,
  },
  response: rawElasticSearchQuery.response,
});

const mapDispatchToProps = (dispatch: any) => ({
  executeRawQuery: (
    orgName: string,
    projectName: string,
    viewId: string | undefined,
    query: string,
    paginationSettings: PaginationSettings
  ): void =>
    dispatch(
      executeRawElasticSearchQuery(
        orgName,
        projectName,
        viewId,
        query,
        paginationSettings
      )
    ),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RawElasticSearchQueryView);
