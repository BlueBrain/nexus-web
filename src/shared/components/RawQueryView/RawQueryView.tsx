import * as React from 'react';
import { Form, Input, Button, Table, Card } from 'antd';
import { executeRawQuery } from '../../store/actions/rawQuery';
import { RawQueryState } from '../../store/reducers/rawQuery';
import { connect } from 'react-redux';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk/lib/views/SparqlView';
import * as hash from 'object-hash';

export interface RawQueryViewProps {
  viewType: "es" | "sparql";
  initialQuery: string;
  fetching: boolean;
  response: SparqlViewQueryResponse;
  wantedOrg: any;
  wantedProject: any;
  executeRawQuery(orgName: string, projectName: string, query: string): void;
}

const TextArea = Input.TextArea;
const FormItem = Form.Item;
const { Column } = Table;

const RawQueryView: React.FunctionComponent<RawQueryViewProps> = ({ fetching, initialQuery, response, executeRawQuery, wantedOrg, wantedProject }) : JSX.Element => {
  const [query, setQuery] = React.useState(initialQuery);

  let cols: string[]
  let data: any;

  if (response.hasOwnProperty("boolean")) {
    cols = ["Result"];
    data = response.boolean;
  }
  else {
    cols = response.head && response.head.vars || [];
    data = response.results && response.results.bindings || [];
  }

  const renderCell = (entry: any) => {
    let value: React.ReactNode;
    switch (entry.type) {
      case "uri":
        value = `<${entry.value}>`;
        break;
      case "bnode":
      case "literal":
      default:
        value = `"${entry.value}"`;
    }

    const additionalAttributes: string[] = [];

    Object.keys(entry)
      .filter(key => key !== "value")
      .forEach(key => {additionalAttributes.push(`"${key}": "${entry[key]}"`)});

    return <span title={additionalAttributes.join(", ")}>{value}</span>;
  };

  const columns = cols.map((col: string) =>
    <Column title={col} dataIndex={col} key={col} render={entry => renderCell(entry)}/>
  );

  return (
    <>
    <Form onSubmit={(e) => {e.preventDefault(); executeRawQuery(wantedOrg, wantedProject, query);}}>
      <FormItem>
        <TextArea
          className="query"
          value={query}
          placeholder={`Enter a valid SPARQL query`}
          onChange={(e) => setQuery(e.target.value)}
        />
      </FormItem>
      <FormItem>
        <Button type="primary" htmlType="submit">Execute SPARQL query</Button>
      </FormItem>
    </Form>
    <Card bordered>
      <Table dataSource={data} pagination={false} rowKey={record => hash(record)} loading={fetching}>
        {columns}
      </Table>
    </Card>
    </>
  );
};

const mapStateToProps = ({ rawQuery }: { rawQuery: RawQueryState}) => ({
  fetching: rawQuery.fetching,
  initialQuery: 'SELECT ?s ?p ?o WHERE {?s ?p ?o} LIMIT 20',
  response: rawQuery.response,
});

const mapDispatchToProps = (dispatch: any) => ({
  executeRawQuery: (orgName: string, projectName: string, query: string): void => dispatch(executeRawQuery(orgName, projectName, query)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RawQueryView);
