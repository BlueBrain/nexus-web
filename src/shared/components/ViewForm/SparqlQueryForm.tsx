import * as React from 'react';
import { Form, Button, Card, Empty, Table, Tooltip } from 'antd';
import Column from 'antd/lib/table/Column';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import * as hash from 'object-hash';
import {
  AskQueryResponse,
  SelectQueryResponse,
  SparqlViewQueryResponse,
} from '@bbp/nexus-sdk';

import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/sparql/sparql';

import './view-form.less';

const FormItem = Form.Item;

type NexusSparqlError =
  | string
  | {
      reason: string;
    };

type Entry = {
  [key: string]: string;
  datatype: string;
  value: string;
  type: string;
};

const SparqlQueryForm: React.FunctionComponent<{
  query: string;
  response: SparqlViewQueryResponse | null;
  busy: boolean;
  error: NexusSparqlError | null;
  onQueryChange: (query: string) => void;
}> = ({ query, response, busy, error, onQueryChange }): JSX.Element => {
  // TODO: Validate Sparql with some cool library
  const [value, setValue] = React.useState(query);

  // NOTE: if the query returns a simple boolean value (for example, ASK query)
  // then we have to make our own column header
  const columnHeaders: string[] =
    (response &&
      (!!(response as AskQueryResponse).boolean
        ? ['Result']
        : response.head && (response as SelectQueryResponse).head.vars)) ||
    [];

  const data: any[] =
    (response &&
      (!!(response as AskQueryResponse).boolean
        ? [(response as AskQueryResponse).boolean.toString()]
        : (response as SelectQueryResponse).results.bindings)) ||
    [];

  const handleChange = (editor: any, data: any, value: string) => {
    if (!value) {
      return;
    }
    setValue(value);
  };

  console.log('Boo', error);
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
            description={typeof error === 'string' ? error : error.reason}
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
