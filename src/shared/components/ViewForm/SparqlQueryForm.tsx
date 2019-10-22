import * as React from 'react';
import { Form, Button, Card, List, Empty, Table, Tooltip } from 'antd';
import Column from 'antd/lib/table/Column';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import * as hash from 'object-hash';

import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/sparql/sparql';

import './view-form.less';

const FormItem = Form.Item;

type Entry = {
  [key: string]: string;
  datatype: string;
  value: string;
  type: string;
};

type Bindings = {
  [variableName: string]: Entry;
}[];

const SparqlQueryForm: React.FunctionComponent<{
  query: string;
  // TODO: update response type
  // after SDK is updated
  // https://github.com/BlueBrain/nexus/issues/755
  response: any | null;
  busy: boolean;
  error: Error | null;
  onQueryChange: (query: string) => void;
}> = ({ query, response, busy, error, onQueryChange }): JSX.Element => {
  // TODO: Validate Sparql with some cool library
  const [value, setValue] = React.useState(query);

  // NOTE: if the query returns a simple boolean value
  // then we have to make our own column header
  const columnHeaders: string[] =
    (response &&
      (!!response.boolean
        ? ['Result']
        : response.head && response.head.vars)) ||
    [];

  const data: Bindings =
    (response &&
      (!!response.boolean ? response.boolean : response.results.bindings)) ||
    [];

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
            {columnHeaders.map((columnHeader: string) => (
              <Column
                title={columnHeader}
                dataIndex={columnHeader}
                key={columnHeader}
                render={(entry: Entry) => {
                  if (!entry) {
                    return <span className="empty">no value</span>;
                  }

                  // TODO: Improve sparql repsonse types visuall
                  // https://github.com/BlueBrain/nexus/issues/756
                  return (
                    <Tooltip title={entry.datatype}>
                      {entry.type === 'uri' ? (
                        <a href={entry.value}>&lt;{entry.value}&gt;</a>
                      ) : (
                        entry.value
                      )}
                    </Tooltip>
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
