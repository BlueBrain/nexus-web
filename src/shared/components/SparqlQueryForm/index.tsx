import * as React from 'react';
import { Form, Button, Card, List, Empty, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import * as hash from 'object-hash';

import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/sparql/sparql';

// TODO move once SparqlQueryView is also refactored
import '../RawQueryView/view-form.less';

const FormItem = Form.Item;

const SparqlQueryForm: React.FunctionComponent<{
  query: string;
  // TODO update response type
  // after SDK is updated
  // https://github.com/BlueBrain/nexus/issues/755
  response: any | null;
  busy: boolean;
  error: Error | null;
  onQueryChange: (query: string) => void;
}> = ({ query, response, busy, error, onQueryChange }): JSX.Element => {
  // TODO: Validate Sparql with some cool library
  const [value, setValue] = React.useState(query);

  let columnHeaders: string[] = [];
  let data: any = [];
  // NOTE: if the query returns a simple boolean value
  // then we have to make our own column title
  if (response && response.hasOwnProperty('boolean')) {
    columnHeaders = ['Result'];
    data = response.boolean;
  } else {
    columnHeaders = (response && response.head && response.head.vars) || [];
    data = (response && response.results && response.results.bindings) || [];
  }

  const handleChange = (editor: any, data: any, value: string) => {
    if (!value) {
      return;
    }
    setValue(value);
  };

  return (
    <div className="view-form">
      <Form
        onSubmit={e => {
          e.preventDefault();
          console.log('onQueryChange', { value });
          onQueryChange(value);
        }}
      >
        <div className="code">
          <CodeMirror
            value={query}
            options={{
              mode: { name: 'sparql' },
              theme: 'base16-light',
              placeholder: 'Enter a valid SPARQL query',
              lineNumbers: true,
              viewportMargin: Infinity,
            }}
            onChange={handleChange}
          />
        </div>
        <FormItem>
          <Button type="primary" htmlType="submit">
            Execute SPARQL query
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
          <Table
            dataSource={data}
            pagination={false}
            // TODO: maybe use index or something instead of hash
            rowKey={record => hash(record)}
            loading={busy}
          >
            {columnHeaders.map((col: string) => (
              <Column
                title={col}
                dataIndex={col}
                key={col}
                render={(entry: any) => {
                  if (!entry) {
                    return <>no value</>;
                  }
                  let value: React.ReactNode;
                  switch (entry.type) {
                    case 'uri':
                      value = <a href={entry.value}>&lt;{entry.value}&gt;</a>;
                      break;
                    case 'bnode':
                    case 'literal':
                    default:
                      value = <>{entry.value}</>;
                  }

                  const additionalAttributes: string[] = [];

                  Object.keys(entry)
                    .filter(key => key !== 'value')
                    .forEach(key => {
                      additionalAttributes.push(`"${key}": "${entry[key]}"`);
                    });

                  return (
                    <span title={additionalAttributes.join(', ')}>{value}</span>
                  );
                }}
              />
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default SparqlQueryForm;
