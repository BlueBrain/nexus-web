import * as React from 'react';
import { Button, Tooltip } from 'antd';
import { flatten, map, uniq, intersection } from 'lodash';
import './Categories.less';
import { CategoryWidgetProps } from '../../types/plugins/report';
import { useSelector } from 'react-redux';
import { RootState } from 'shared/store/reducers';
import { InfoCircleOutlined } from '@ant-design/icons';

const CategoryWidget = ({
  dispatch,
  analysisReports,
  selectedCategories,
  mode,
  selectCategory,
}: CategoryWidgetProps) => {
  const { analysisPluginCategories } = useSelector(
    (state: RootState) => state.config
  );
  const categories = analysisPluginCategories['DetailedCircuit'];
  const categoryLabels = categories.map(({ label }) => label);

  const availableCategories =
    mode === 'create'
      ? categoryLabels
      : intersection(
          uniq(flatten(map(analysisReports, 'categories'))),
          categoryLabels
        );

  return (
    <>
      {availableCategories && availableCategories.length > 1 && (
        <div className="categories-filter">
          {mode !== 'create' && <h3>Categories</h3>}
          <p>You may select one or multiple from the list</p>
          <div className="categories">
            {categories
              .filter(c => availableCategories.includes(c.label))
              .map((cat, i) => (
                <Button
                  key={i}
                  type="default"
                  onClick={() => selectCategory(cat.label)}
                  className={`group-buttons ${
                    selectedCategories.includes(cat.label) ? 'active' : ''
                  }`}
                >
                  {cat.label}
                  <Tooltip title={cat.description}>
                    <InfoCircleOutlined />
                  </Tooltip>
                </Button>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryWidget;
