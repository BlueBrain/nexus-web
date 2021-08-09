import * as React from 'react';
import { Progress } from 'antd';

import './ProjectQuotas.less';

const ProjectQuotas: React.FC<{
  quotaResources: number;
  totalResources: number;
}> = ({ quotaResources, totalResources }) => {
  const percent = (totalResources / quotaResources) * 100;

  console.log('percent', percent);

  return (
    <div className="project-quotas">
      <h3>Data Volume</h3>
      <div className="project-quotas__dashboard">
        {/* <Progress percent={75} /> */}
        <Progress strokeLinecap="square" type="dashboard" percent={percent} />
      </div>
      <h4>Total: {totalResources} Resources</h4>
      <h4>Quota: {quotaResources} Resources</h4>
    </div>
  );
};

export default ProjectQuotas;
