import * as React from 'react';
import { Form, Icon, Button, Card, List, Empty } from 'antd';
import {
  executeRawElasticSearchQuery,
  resetQueryAction,
} from '../../store/actions/rawQuery';
import { RawElasticSearchQueryState } from '../../store/reducers/rawQuery';
import { connect } from 'react-redux';
import { PaginatedList, PaginationSettings } from '@bbp/nexus-sdk-legacy';
import { ElasticSearchHit } from '@bbp/nexus-sdk-legacy/lib/View/ElasticSearchView/types';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { RequestError } from '../../store/actions/utils/errors';
import './view-form.less';

// Codemirror will not load on the server, so we need to make sure
// the language support code doesn't load either.
if (typeof window !== 'undefined') {
  require('codemirror/mode/javascript/javascript');
  require('codemirror/addon/display/placeholder');
}

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
  error: RequestError | null;
  executeRawQuery(
    orgName: string,
    projectName: string,
    viewID: string | undefined,
    query: string,
    paginationSettings: PaginationSettings
  ): void;
  reset: VoidFunction;
}

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
  error,
  reset,
}): JSX.Element => {
  React.useEffect(() => {
    return reset;
  }, []);

  const formattedInitialQuery = JSON.stringify(
    JSON.parse(initialQuery),
    null,
    2
  );
  const [query, setQuery] = React.useState(formattedInitialQuery);
  const [valid, setValid] = React.useState(true);

  // Sometimes the results from sparql query are living in this response
  // That's really bad!
  // That's because these two queries share redux stuff
  // This is a quick fix to solve this bug without doing much infrastructure work.
  let data: any[];
  if (response && (response as any).head) {
    data = [];
  } else {
    data = response.results.map(result => result._source || []);
  }
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
      formattedInitialQuery,
      paginationSettings
    );
  };

  const handleChange = (editor: any, data: any, value: any) => {
    try {
      JSON.parse(value);
      setQuery(value);
      setValid(true);
    } catch (error) {
      setValid(false);
    }
  };

  return (
    <div className="view-form">
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
        <>
          <div className="control-panel">
            <div>
              <div className={`feedback ${valid ? '_positive' : '_negative'}`}>
                <Icon type={valid ? 'check-circle' : 'exclamation-circle'} />{' '}
                {valid ? 'Valid JSON' : 'Invalid JSON'}
              </div>
            </div>
          </div>
          <CodeMirror
            value={formattedInitialQuery}
            options={{
              mode: { name: 'javascript', json: true },
              theme: 'base16-light',
              placeholder: 'Enter a valid ElasticSearch query',
              viewportMargin: Infinity,
            }}
            onChange={handleChange}
          />
        </>
        <FormItem>
          <Button type="primary" htmlType="submit" disabled={!valid}>
            Execute ElasticSearch query
          </Button>
        </FormItem>
      </Form>
      <Card bordered className="results">
        {error && (
          <Empty
            description={
              error.message === 'Bad Request'
                ? 'The query is malformed'
                : error.message
            }
          />
        )}
        {!error && (
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
        )}
      </Card>
    </div>
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
  reset: () => dispatch(resetQueryAction()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RawElasticSearchQueryView);
