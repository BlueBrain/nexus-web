import * as React from 'react';
import { Badge, Button, Popover } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNexusContext } from '@bbp/react-nexus';
import {
  DEFAULT_SPARQL_VIEW_ID,
  SparqlViewQueryResponse,
} from '@bbp/nexus-sdk';

import fusionConfig from '../config';
import NotififcationsPopover from '../components/NotificationsPopover';

const NotificationsContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();

  const [unlinkedActivities, setUnlinkedActivities] = React.useState<any[]>([]);
  const activities: any[] = [
    { name: 'Activity 1', createdOn: '1 may 2020', createdBy: 'stafeeva' },
    { name: 'Activity 2', createdOn: '1 may 2020', createdBy: 'dylanTheDog' },
    {
      name:
        'This is an activity with a very very very very very super long name',
      createdOn: '1 may 2020',
      createdBy: 'dylanTheDog',
    },
  ];
  React.useEffect(() => {
    console.log('setting stuff...');

    // fetch resources type Activity, that has no WorkflowStep linked TO it
    // nxv:Activities
    const query = `SELECT ?s ?name
    WHERE {
      #?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/FusionActivity> .
            { ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/FusionActivity> ;
                 <https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/name> ?name .
                } MINUS { 
              ?wfstep <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/WorkflowStep> ;
                   <https://bluebrain.github.io/nexus/vocabulary/activities> ?s .
            }
              #<https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/name> ?name ;
              #<https://bluebrain.github.io/nexus/vocabulary/incoming> ?incoming .
          } 
    LIMIT 100`;

    nexus.View.sparqlQuery(
      orgLabel,
      projectLabel,
      DEFAULT_SPARQL_VIEW_ID,
      query
    )
      .then((response: SparqlViewQueryResponse) => {
        console.log('response', response);
      })
      .catch(error => {
        // show error
      });

    setUnlinkedActivities(activities);
  }, []);

  // TODO: link an unlinked activity https://github.com/BlueBrain/nexus/issues/1817
  const linkActivity = () => {
    console.log('linkActivity');
  };

  // TODO: create a new step from an unlinked activity https://github.com/BlueBrain/nexus/issues/1818
  const addNew = () => {
    console.log('addNew');
  };

  return (
    <Popover
      placement="topLeft"
      title={
        <h3
          style={{ marginTop: '7px' }}
        >{`${unlinkedActivities.length} detached activities`}</h3>
      }
      content={
        <NotififcationsPopover
          activities={unlinkedActivities}
          onClickLinkActivity={linkActivity}
          onClickNew={addNew}
        />
      }
      trigger="click"
    >
      <Badge count={unlinkedActivities.length}>
        <Button
          icon={<BellOutlined style={{ color: 'inherit' }} />}
          shape="circle"
          style={{ marginLeft: '7px' }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationsContainer;
