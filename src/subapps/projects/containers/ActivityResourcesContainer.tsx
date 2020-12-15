import * as React from 'react';
import { Spin } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import ResultsTable from '../../../shared/components/ResultsTable/ResultsTable';
import { displayError } from '../components/Notifications';
import fusionConfig from '../config';
import { CodeResourceData } from '../components/LinkCodeForm';
import { StepResource } from '../views/WorkflowStepView';
import { useLinkedActivities, ActivityItem } from '../hooks/useActivities';

const ActivityResourcesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  workflowStep: StepResource;
  linkCodeToActivity: (codeResourceId: string) => void;
}> = ({ orgLabel, projectLabel, workflowStep, linkCodeToActivity }) => {
  const nexus = useNexusContext();
  const { items, headerProperties } = useLinkedActivities(
    orgLabel,
    projectLabel,
    workflowStep._self
  );

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

  return (
    <div className="resources-list" style={{ margin: '20px' }}>
      <Spin spinning={items ? false : true}>
        <ResultsTable
          headerProperties={headerProperties}
          items={items ? (items as ActivityItem[]) : []}
          handleClick={() => {}}
        />
      </Spin>
    </div>
  );
};

export default ActivityResourcesContainer;
