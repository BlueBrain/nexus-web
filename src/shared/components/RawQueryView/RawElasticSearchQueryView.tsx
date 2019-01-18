import * as React from 'react';
import { Form, Input, Button, Card } from 'antd';
import { executeRawElasticSearchQuery } from '../../store/actions/rawQuery';
import { RawElasticSearchQueryState } from '../../store/reducers/rawQuery';
import { connect } from 'react-redux';
import { PaginatedList } from '@bbp/nexus-sdk';
import { ElasticSearchHit } from '@bbp/nexus-sdk/lib/View/ElasticSearchView';

let ReactJson: any;
if (typeof window !== 'undefined') {
  ReactJson = require('react-json-view').default;
}

export interface RawElasticSearchQueryViewProps {
  initialQuery: string;
  fetching: boolean;
  response: PaginatedList<ElasticSearchHit>;
  wantedOrg: string;
  wantedProject: string;
  wantedView?: string;
  executeRawQuery(orgName: string, projectName: string, viewID: string | undefined, query: string): void;
}

const TextArea = Input.TextArea;
const FormItem = Form.Item;

const RawElasticSearchQueryView: React.FunctionComponent<RawElasticSearchQueryViewProps> = ({ fetching, initialQuery, response, executeRawQuery, wantedOrg, wantedProject, wantedView }) : JSX.Element => {
  const [query, setQuery] = React.useState(initialQuery);

  const data = response.results.map(result => result._source || {});

  return (
    <>
    <Form onSubmit={(e) => {e.preventDefault(); executeRawQuery(wantedOrg, wantedProject, wantedView, query);}}>
      <FormItem>
        <TextArea
          className="query"
          value={query}
          placeholder={`Enter a valid ElasticSearch query`}
          onChange={(e) => setQuery(e.target.value)}
          autosize
        />
      </FormItem>
      <FormItem>
        <Button type="primary" htmlType="submit">Execute ElasticSearch query</Button>
      </FormItem>
    </Form>
    <Card bordered>
      <ReactJson src={data || {}} name="Results" />
    </Card>
    </>
  );
};

const mapStateToProps = ({ rawElasticSearchQuery }: { rawElasticSearchQuery: RawElasticSearchQueryState}) => ({
  fetching: rawElasticSearchQuery.fetching,
  initialQuery: JSON.stringify({
    "query": {
      "term": {
        "_deprecated": false
      }
    }
  }, null, 2),
  response: rawElasticSearchQuery.response,
});

const mapDispatchToProps = (dispatch: any) => ({
  executeRawQuery: (orgName: string, projectName: string, viewId: string | undefined, query: string): void => dispatch(executeRawElasticSearchQuery(orgName, projectName, viewId, query)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RawElasticSearchQueryView);
