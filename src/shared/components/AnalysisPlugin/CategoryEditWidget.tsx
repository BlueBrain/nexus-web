import * as React from 'react';
import { Select, Form } from 'antd';
import './CategoryTypeEdits.less';
import { CategoryEditWidgetProps } from '../../types/plugins/report';
import { changeAnalysisCategories } from '../../slices/plugins/report';
import { REPORT_CATEGORIES as CATEGORIES } from '../../../constants';

const CategoryEditWidget = ({
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
      {CATEGORIES.circuit && CATEGORIES.circuit.length > 0 && (
        <div style={{ margin: '20px 0' }} className={'categoryEdits'}>
          <Form layout={'vertical'}>
            <Form.Item label="Categories" aria-label="Analysis Categories">
              <Select
                mode="multiple"
                placeholder="Inserted are removed"
                value={activeCategories}
                onChange={selectedCategories}
                style={{ maxWidth: '900px' }}
              >
                {CATEGORIES.circuit.map(item => (
                  <Select.Option key={item} value={item}>
                    {item}
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
