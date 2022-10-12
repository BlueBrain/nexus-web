import * as React from 'react';
import { Select, Form } from 'antd';
import './CategoryTypeEdits.less';
import { CategoryEditWidgetProps } from '../../types/plugins/report';
import { changeAnalysisCategories } from '../../slices/plugins/report';
import { useSelector } from 'react-redux';
import { RootState } from 'shared/store/reducers';

const CategoryEditWidget = ({
  dispatch,
  currentlyBeingEditedAnalysisReportCategories,
}: CategoryEditWidgetProps) => {
  const { analysisPluginCategories } = useSelector(
    (state: RootState) => state.config
  );

  // TODO: stop hardcoding this and refactor to pass in categories as prop
  const categoryLabels = analysisPluginCategories['DetailedCircuit'].map(
    ({ label }) => label
  );

  const activeCategories = currentlyBeingEditedAnalysisReportCategories
    ? currentlyBeingEditedAnalysisReportCategories
    : [];

  const selectedCategories = (items: any) => {
    dispatch(changeAnalysisCategories({ categories: items }));
  };
  return (
    <>
      {categoryLabels && categoryLabels.length > 0 && (
        <div style={{ margin: '20px 0' }} className={'categoryEdits'}>
          <h4 style={{ marginTop: '10px', color: '#003A8C' }}>Categories</h4>
          <Form layout={'vertical'}>
            <Form.Item label="" aria-label="Analysis Categories">
              <Select
                mode="multiple"
                placeholder="Inserted are removed"
                value={activeCategories}
                onChange={selectedCategories}
                style={{ maxWidth: '900px' }}
              >
                categoryLabels
                {categoryLabels.map(item => (
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
