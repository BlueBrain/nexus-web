import './CategoryTypeEdits.scss';

import { Form,Select } from 'antd';
import * as React from 'react';

import { changeAnalysisCategories } from '../../slices/plugins/report';
import { CategoryEditWidgetProps } from '../../types/plugins/report';

const CategoryEditWidget = ({
  allCategories,
  dispatch,
  currentlyBeingEditedAnalysisReportCategories,
}: CategoryEditWidgetProps) => {
  const activeCategories = currentlyBeingEditedAnalysisReportCategories
    ? currentlyBeingEditedAnalysisReportCategories
    : [];

  const selectedCategories = (items: any) => {
    dispatch(changeAnalysisCategories({ categories: items }));
  };
  return (
    <>
      {allCategories && allCategories.length > 0 && (
        <div style={{ margin: '20px 0' }} className={'categoryEdits'}>
          <h4 style={{ marginTop: '10px', color: '003a8c' }}>Categories</h4>
          <Form layout={'vertical'}>
            <Form.Item label="" aria-label="Analysis Categories">
              <Select
                mode="multiple"
                placeholder="Inserted are removed"
                value={activeCategories}
                onChange={selectedCategories}
                style={{ maxWidth: '900px' }}
              >
                {allCategories.map(cat => (
                  <Select.Option key={cat.label} value={cat.label}>
                    {cat.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      )}
    </>
  );
};

export default CategoryEditWidget;
