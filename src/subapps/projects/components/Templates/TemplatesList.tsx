import * as React from 'react';

import TemplateCard from './TemplateCard';

import './TemplatesList.less';

const TemplatesList: React.FC<{ templates: any[] }> = ({ templates }) => {
  return (
    <div className="templates-list">
      <h2>Select Template</h2>
      <div className="templates-list__cards">
        {templates.length
          ? templates.map(template => <TemplateCard template={template} />)
          : 'No templates found for this project :('}
      </div>
    </div>
  );
};

export default TemplatesList;
