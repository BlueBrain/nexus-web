import * as React from 'react';
import { Select, Form } from 'antd';
import { intersection } from 'lodash';
import './Categories.less';
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
    const [selectedItems, setSelectedItems] = React.useState<string[]>(
      activeCategories
    );
//   console.log(
//     'CATEGORIES.circuit EDIT WIDGET, selectedtypes, current',
//     selectedItems,
//   );
    const mysetSelectedItems = (option: any) => {
        console.log("MY SET active categories ITEMS", activeCategories, option);
        dispatch(changeAnalysisCategories({ categories: activeCategories }));
    }
  return (
    <>
      {CATEGORIES.circuit && CATEGORIES.circuit.length > 0 && (
        <div style={{ margin: '20px 0' }}>
          <Form layout={'vertical'}>
            <Form.Item
              label="Report Categories"
              aria-label="Analysis Categories"
            >
              <Select
                mode="multiple"
                placeholder="Inserted are removed"
                value={activeCategories}
                onChange={mysetSelectedItems}
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
