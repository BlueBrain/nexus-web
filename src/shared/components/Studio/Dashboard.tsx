import * as React from 'react';

import './Dashboard.less';

const Dashboard: React.FunctionComponent<{
  label?: string;
  description?: string;
  plugins?: string[];
}> = ({ label, description }) => {
  return (
    <div className="dashboard">
      <h1>{label}</h1>
      <p>{description}</p>
    </div>
  );
};

export default Dashboard;
