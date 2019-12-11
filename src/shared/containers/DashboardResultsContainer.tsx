import * as React from 'react';
import { Spin, Alert, Button } from 'antd';
import ResultsTable from '../components/ResultsTable/ResultsTable';
import { camelCaseToLabelString } from '../utils';
import {
  Resource,
  SelectQueryResponse,
  SparqlViewQueryResponse,
} from '@bbp/nexus-sdk';
import ResourceCardComponent from '../components/ResourceCard';
import { useHistory } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';

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

type NexusSparqlError = {
  reason: string;
};

const DashboardResultsContainer: React.FunctionComponent<{
  dataQuery: string;
  orgLabel: string;
  projectLabel: string;
  viewId: string;
  workspaceId: string;
  dashboardId: string;
  studioResourceId: string;
}> = ({
  orgLabel,
  projectLabel,
  dataQuery,
  viewId,
  workspaceId,
  dashboardId,
  studioResourceId,
}) => {
  const history = useHistory();
  const [selectedResource, setSelectedResource] = React.useState<Resource>();
  const [error, setError] = React.useState<NexusSparqlError | Error>();
  const [items, setItems] = React.useState<any[]>();
  const [headerProperties, setHeaderProperties] = React.useState<any[]>();
  const nexus = useNexusContext();
  const selectResource = (selfUrl: string, setHistory = true) => {
    nexus
      .httpGet({ path: selfUrl })
      .then(res => {
        setSelectedResource(res);
        if (setHistory) {
          updateResourcePath(res);
        }
      })
      .catch(e => {
        setError(e);
        // TODO: show a meaningful error to the user.
      });
  };

  const updateResourcePath = (res: Resource) => {
    const path = history.location.pathname.split('/studioResource');
    let newPath;
    if (path[0].includes('/workspaces') && path[0].includes('/dashboards')) {
      newPath = `${path[0]}/studioResource/${encodeURIComponent(res['@id'])}`;
      history.push(newPath);
    } else {
      if (path[0].includes('/dashboards')) {
        newPath = `${
          path[0]
        }/workspaces/${workspaceId}/dashboards/${encodeURIComponent(
          dashboardId
        )}/studioResource/${encodeURIComponent(res['@id'])}`;
      } else {
        newPath = `${path[0]}/dashboards/${encodeURIComponent(
          dashboardId
        )}/studioResource/${encodeURIComponent(res['@id'])}`;
        history.push(newPath);
      }
    }
    history.push(newPath);
  };

  const unSelectResource = () => {
    setSelectedResource(undefined);
  };

  React.useEffect(() => {
    nexus.View.sparqlQuery(
      orgLabel,
      projectLabel,
      encodeURIComponent(viewId),
      dataQuery
    ).then((result: SparqlViewQueryResponse) => {
      const data: SelectQueryResponse = result as SelectQueryResponse;
      const tempHeaderProperties: {
        title: string;
        dataIndex: string;
      }[] = data.head.vars
        .filter(
          // we don't want to display total or self url in result table
          (headVar: string) => !(headVar === 'total' || headVar === 'self')
        )
        .map((headVar: string) => ({
          title: camelCaseToLabelString(headVar), // TODO: get the matching title from somewhere?
          dataIndex: headVar,
        }));
      setHeaderProperties(tempHeaderProperties);
      // build items
      const tempItems = data.results.bindings
        // we only want resources
        .filter((binding: Binding) => binding.self)
        .map((binding: Binding, index: number) => {
          // let's get the value for each headerProperties
          const properties = tempHeaderProperties.reduce(
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
            id: index.toString(), // id is used by antd component
            self: binding.self, // used in order to load details or resource once selected
            key: index.toString(), // used by react component (unique key)
          };
        });

      const currentResource = data.results.bindings
        .filter((binding: Binding) => binding.self)
        .find((binding: Binding) => {
          return binding.self.value.includes(studioResourceId);
        });
      if (selectedResource === undefined && currentResource !== undefined) {
        selectResource(currentResource.self.value, false);
      }
      setItems(tempItems);
    }).catch(e => {
      setError(e);
    });
  }, [orgLabel, projectLabel, dataQuery, viewId]);

  if (error) {    
    return (
      <Alert
        message="Error loading dashboard"
        description={`Something went wrong. ${(error as NexusSparqlError).reason || (error as Error).message}`}
        type="error"
      />
    );
  }

  return (
    <Spin spinning={selectedResource || items ? false : true}>
      {selectedResource ? (
        <div className="studio-resource">
          <Button
            type="primary"
            size="small"
            className={'studio-back-button'}
            icon="caret-left"
            onClick={unSelectResource}
          >
            {' '}
            Back{' '}
          </Button>
          <ResourceCardComponent resource={selectedResource} />
        </div>
      ) : (
        <ResultsTable
          headerProperties={headerProperties}
          items={items ? (items as Item[]) : []}
          handleClick={selectResource}
        />
      )}
    </Spin>
  );
};

export default DashboardResultsContainer;
