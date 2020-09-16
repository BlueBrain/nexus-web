import * as React from 'react';
import { Button } from 'antd';

import TemplateCard, { Template } from './TemplateCard';

import './TemplatesList.less';

const TemplatesList: React.FC<{
  templates: Template[];
  onClickAdd(id: string): void;
}> = ({ templates, onClickAdd }) => {
  const [selected, setSelected] = React.useState<string>('');

  const onClickTemplate = (id: string) => {
    setSelected(id);
  };

  const onClickAddActivities = () => {
    onClickAdd(selected);
  };

  return (
    <div className="templates-list">
      <h2>Add activities from template</h2>
      <div className="templates-list__cards">
        {templates.length
          ? templates.map(template => (
              <button
                type="button"
                className="button-no-styling"
                onClick={() => onClickTemplate(template['@id'])}
              >
                <TemplateCard template={template} />
              </button>
            ))
          : 'No templates found for this project :('}
      </div>
      <div className="templates-list__button-box">
        <Button
          onClick={onClickAddActivities}
          type="primary"
          disabled={!selected}
        >
          {selected !== '' ? 'Select Template' : 'Add Activities'}
        </Button>
      </div>
    </div>
  );
};

export default TemplatesList;
