import * as React from 'react';
import { Spin } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import {
  SelectQueryResponse,
  SparqlViewQueryResponse,
  Resource,
} from '@bbp/nexus-sdk';
import ResultsTable from '../../../shared/components/ResultsTable/ResultsTable';
import { displayError } from '../components/Notifications';
import fusionConfig from '../config';
import { CodeResourceData } from '../components/LinkCodeForm';
import ResourcesSearch from '../components/ResourcesSearch';
import { StepResource } from '../views/WorkflowStepView';
import { useActivityResources } from '../hooks/useStepResources';
import { camelCaseToLabelString, parseProjectUrl } from '../../../shared/utils';

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

const ActivityResourcesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  workflowStep: StepResource;
  linkCodeToActivity: (codeResourceId: string) => void;
}> = ({ orgLabel, projectLabel, workflowStep, linkCodeToActivity }) => {
  const nexus = useNexusContext();
  const [activeTab, setActiveTab] = React.useState<string>('Activities');

  const [headerProperties, setHeaderProperties] = React.useState<any[]>([]);
  const [items, setItems] = React.useState<any[]>();
  console.log(workflowStep);

  const viewId = 'nxv:defaultSparqlIndex';

  const activitiesQuery = `
    PREFIX nxv: <https://bluebrain.github.io/nexus/vocabulary/>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    SELECT  DISTINCT ?self ?activity ?createdAt ?createdBy ?used ?generated
    WHERE {
      ?activity nxv:self ?self ;
                <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> prov:Activity ;
                nxv:createdAt ?createdAt ;
                nxv:createdBy ?createdBy .
      ?wfstep nxv:self <${encodeURIComponent(workflowStep._self)}> ;
              nxv:activities ?activity .
      OPTIONAL { ?activity nxv:used ?used }
      OPTIONAL { ?activity nxv:generated ?generated }
    }
    LIMIT 100
  `;

  // all activities in the project
  const activitiesQueryTwo = `
    PREFIX nxv: <https://bluebrain.github.io/nexus/vocabulary/>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    SELECT  ?self ?activity ?createdAt ?createdBy ?used ?generated
    WHERE {
      ?activity nxv:self ?self ;
                <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> prov:Activity ;
                nxv:createdAt ?createdAt ;
                nxv:createdBy ?createdBy .
      OPTIONAL { ?activity nxv:used ?used }
      OPTIONAL { ?activity nxv:generated ?generated }
    }
    LIMIT 100
  `;

  // `PREFIX nxv: <https://bluebrain.github.io/nexus/vocabulary/>
  // PREFIX prov: <http://www.w3.org/ns/prov#>
  // SELECT ?resource ?name ?createdBy ?createdAt ?used ?generated ?resourceType
  // WHERE {
  //   { ?resource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> prov:Activity ;
  //                 nxv:createdBy ?createdBy ;
  //                 nxv:createdAt ?createdAt ;
  //                 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?resourceType
  //    OPTIONAL { ?resource <http://schema.org/name> ?name }
  //    OPTIONAL { ?resource nxv:used ?used }
  //    OPTIONAL { ?resource nxv:generated ?generated }
  //   } MINUS {
  //     ?wfstep <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> nxv:WorkflowStep ;
  //             nxv:activities ?resource .
  //   }
  // }
  // LIMIT 100`;

  const notesQuery = `# This is a simple example query
          # You can directly edit this
          prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/>
          SELECT DISTINCT ?self ?s
          WHERE {
          ?s nxv:self ?self
          }
          LIMIT 100`;
  const InputQuery = `# This is a simple example query
          # You can directly edit this
          prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/>
          SELECT DISTINCT ?self ?s
          WHERE {
          ?s nxv:self ?self
          }
          LIMIT 100`;

  const dataQuery = React.useMemo(() => {
    if (activeTab === 'Notes') {
      return notesQuery;
    }
    if (activeTab === 'Activities') {
      return activitiesQuery;
    }
    return InputQuery;
  }, [activeTab]);

  React.useEffect(() => {
    nexus.View.sparqlQuery(
      orgLabel,
      projectLabel,
      encodeURIComponent(viewId),
      dataQuery
    )
      .then((result: SparqlViewQueryResponse) => {
        console.log('data', result);

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
        setItems(tempItems);
      })
      .catch(error => {
        displayError(error, 'Failed to save');
      });
  }, [dataQuery]);

  const addCodeResource = (data: CodeResourceData) => {
    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': fusionConfig.codeType,
      ...data,
    })
      .then(response => {
        linkCodeToActivity(response['@id']);
      })
      .catch(error => displayError(error, 'Failed to save'));
  };

  console.log('items', items);

  return (
    <div className="resources-list" style={{ margin: '20px' }}>
      <Spin spinning={items ? false : true}>
        <ResultsTable
          headerProperties={headerProperties}
          items={items ? (items as Item[]) : []}
          handleClick={() => {}}
        />
      </Spin>
    </div>
  );
};

export default ActivityResourcesContainer;
