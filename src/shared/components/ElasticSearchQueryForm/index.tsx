import * as React from 'react';
import { Form, Icon, Button, Card, List, Empty } from 'antd';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import ReactJson from 'react-json-view';
import { ElasticSearchViewQueryResponse } from '@bbp/nexus-sdk';
import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/javascript/javascript';

// TODO move once SparqlQueryView is also refactored
import '../RawQueryView/view-form.less';

const FormItem = Form.Item;
const ListItem = List.Item;

const ElasticSearchQueryForm: React.FunctionComponent<{
  query: object;
  response: ElasticSearchViewQueryResponse<any> | null;
  busy: boolean;
  error: Error | null;
  from: number;
  size: number;
  onPaginationChange: (page: number) => void;
  onQueryChange: (query: object) => void;
}> = ({
  query,
  response,
  busy,
  error,
  from,
  size,
  onPaginationChange,
  onQueryChange,
}): JSX.Element => {
  const [initialQuery, setInitialQuery] = React.useState('');
  const [valid, setValid] = React.useState(true);
  const [value, setValue] = React.useState();

  React.useEffect(() => {
    // only on first render!
    const formattedInitialQuery = JSON.stringify(query, null, 2);
    setInitialQuery(formattedInitialQuery);
  }, []);

  const data =
    response && response.hits.hits.map(result => result._source || []);
  const total =
    (response && response.hits.total && response.hits.total.value) || 0;
  const totalPages = Math.ceil(total / size);
  const current = Math.floor((totalPages / total) * from + 1);

  const handleChange = (editor: any, data: any, value: string) => {
    try {
      JSON.parse(value);
      setValue(value);
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
          onQueryChange(JSON.parse(value));
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
            value={initialQuery}
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
            loading={busy}
            header={
              <p className="result">{`Found ${total} result${
                total > 1 ? 's' : ''
              }`}</p>
            }
            dataSource={data || []}
            pagination={{
              total,
              current,
              pageSize: size,
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

export default ElasticSearchQueryForm;
