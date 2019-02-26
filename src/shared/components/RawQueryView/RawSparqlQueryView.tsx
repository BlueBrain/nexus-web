import * as React from 'react';
import { Form, Icon, Button, Table, Card } from 'antd';
import { executeRawQuery } from '../../store/actions/rawQuery';
import { RawQueryState } from '../../store/reducers/rawQuery';
import { connect } from 'react-redux';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk/lib/View/SparqlView/types';
import * as hash from 'object-hash';
import { UnControlled as CodeMirror } from 'react-codemirror2';

// Codemirror will not load on the server, so we need to make sure
// the language support code doesn't load either.
if (typeof window !== 'undefined') {
  require('codemirror/mode/sparql/sparql');
  require('codemirror/addon/display/placeholder');
}


export interface RawSparqlQueryViewProps {
  initialQuery: string;
  fetching: boolean;
  response: SparqlViewQueryResponse;
  wantedOrg: any;
  wantedProject: any;
  executeRawQuery(orgName: string, projectName: string, query: string): void;
}

const FormItem = Form.Item;
const { Column } = Table;

const RawSparqlQueryView: React.FunctionComponent<RawSparqlQueryViewProps> = ({
  fetching,
  initialQuery,
  response,
  executeRawQuery,
  wantedOrg,
  wantedProject,
}): JSX.Element => {
  const [query, setQuery] = React.useState(initialQuery);

  let cols: string[];
  let data: any;

  if (response.hasOwnProperty('boolean')) {
    cols = ['Result'];
    data = response.boolean;
  } else {
    cols = (response.head && response.head.vars) || [];
    data = (response.results && response.results.bindings) || [];
  }

  const renderCell = (entry: any) => {
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

    return <span title={additionalAttributes.join(', ')}>{value}</span>;
  };

  const columns = cols.map((col: string) => (
    <Column
      title={col}
      dataIndex={col}
      key={col}
      render={entry => renderCell(entry)}
    />
  ));

  const handleChange = (editor: any, data: any, value: any) => {
    try {
      setQuery(value);
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log('error', error)
    }
  };


  return (
    <>
      <Form
        onSubmit={e => {
          e.preventDefault();
          executeRawQuery(wantedOrg, wantedProject, query);
        }}
      >
        <CodeMirror

          value={initialQuery}
          options={{
            mode: { name: 'sparql' },
            theme: 'base16-light',
            placeholder: 'Enter a valid SPARQL query',
            viewportMargin: Infinity,
          }}
          onChange={handleChange}
        />
        <FormItem>
          <Button type="primary" htmlType="submit">
            Execute SPARQL query
          </Button>
        </FormItem>
      </Form>
      <Card bordered>
        <Table
          dataSource={data}
          pagination={false}
          rowKey={record => hash(record)}
          loading={fetching}
        >
          {columns}
        </Table>
      </Card>
    </>
  );
};

const mapStateToProps = ({ rawQuery }: { rawQuery: RawQueryState }) => ({
  fetching: rawQuery.fetching,
  initialQuery: 'SELECT ?s ?p ?o WHERE {?s ?p ?o} LIMIT 20',
  response: rawQuery.response,
});

const mapDispatchToProps = (dispatch: any) => ({
  executeRawQuery: (
    orgName: string,
    projectName: string,
    query: string
  ): void => dispatch(executeRawQuery(orgName, projectName, query)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RawSparqlQueryView);
