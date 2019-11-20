import * as React from 'react';
import { useNexus } from '@bbp/react-nexus';
import { Spin, Alert } from 'antd';
import ResultsTable from '../components/ResultsTable/ResultsTable';
import { camelCaseToLabelString } from '../utils';

export type Binding = {
  [key: string]: {
    dataType?: string;
    type: string;
    value: string;
  };
};

type Item = {
  id: string;
  self: string;
  key: string;
  [key: string]: any;
};

const DashboardResultsContainer: React.FunctionComponent<{
  dataQuery: string;
  orgLabel: string;
  projectLabel: string;
  viewId: string;
  handleClick: (self: string) => void;
}> = props => {
  const { loading, data, error } = useNexus<any>(
    nexus =>
      nexus.View.sparqlQuery(
        props.orgLabel,
        props.projectLabel,
        encodeURIComponent(props.viewId),
        props.dataQuery
      ),
    []
  );

  if (error) {
    return (
      <Alert
        message="Error loading dashboard"
        description={`Something went wrong: ${error.message || error}`}
        type="error"
      />
    );
  }

  // build header properties
  const headerProperties: {
    title: string;
    dataIndex: string;
  }[] =
    data &&
    data.head.vars
      .filter(
        // we don't want to display total or self url in result table
        (headVar: string) => !(headVar === 'total' || headVar === 'self')
      )
      .map((headVar: string) => ({
        title: camelCaseToLabelString(headVar), // TODO: get the matching title from somewhere?
        dataIndex: headVar,
      }));

  // build items
  const items =
    data &&
    data.results.bindings
      // we only want resources
      .filter((binding: Binding) => binding.self)
      .map((binding: Binding, index: number) => {
        // let's get the value for each headerProperties
        const properties = headerProperties.reduce(
          (prev, curr) => ({
            ...prev,
            [curr.dataIndex]:
              (binding[curr.dataIndex] && binding[curr.dataIndex].value) ||
              undefined,
          }),
          {}
        );
        // return item data
        return {
          ...properties, // our properties
          id: index, // id is used by antd component
          self: binding.self ? binding.self : index, // used in order to load details or resource once selected
          key: index, // used by react component (unique key)
        };
      });

  return (
    <Spin spinning={loading}>
      {data && (
        <ResultsTable
          headerProperties={headerProperties}
          items={items}
          handleClick={props.handleClick}
        />
      )}
    </Spin>
  );
};

export default DashboardResultsContainer;
