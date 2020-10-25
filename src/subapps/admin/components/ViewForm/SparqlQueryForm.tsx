import * as React from 'react';
import { Form, Button } from 'antd';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk';

import SparqlQueryResults, { NexusSparqlError } from './SparqlQueryResults';
import SparqlQueryInput from './SparqlQueryInput';

import './view-form.less';

const FormItem = Form.Item;

const SparqlQueryForm: React.FunctionComponent<{
  query: string;
  response: SparqlViewQueryResponse | null;
  busy: boolean;
  error: NexusSparqlError | null;
  resultsComponent?(props: {
    response: SparqlViewQueryResponse | null;
    busy: boolean;
    error: NexusSparqlError | null;
  }): React.ReactElement;
  onQueryChange: (query: string) => void;
}> = ({
  query,
  response,
  busy,
  error,
  onQueryChange,
  resultsComponent = SparqlQueryResults,
}): JSX.Element => {
  const handleFormSubmit = ({ input }: { input: string }) => {
    input && onQueryChange(input);
  };

  return (
    <div className="view-form">
      <Form onFinish={handleFormSubmit}>
        <FormItem name="input" initialValue={query}>
          <SparqlQueryInput />
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">
            Execute SPARQL query
          </Button>
        </FormItem>
      </Form>
      {resultsComponent({ error, busy, response })}
    </div>
  );
};

export default SparqlQueryForm;
