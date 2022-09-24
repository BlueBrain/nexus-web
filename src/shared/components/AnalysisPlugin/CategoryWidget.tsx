import * as React from 'react';
import { Button } from 'antd';
import { flatten, map, uniq, intersection } from 'lodash';
import './Categories.less';
import { CategoryWidgetProps } from '../../types/plugins/report';

import { REPORT_CATEGORIES as CATEGORIES } from '../../../constants';

const CategoryWidget = ({
  dispatch,
  analysisReports,
  selectedCategories,
  mode,
  selectCategory,
}: CategoryWidgetProps) => {
  const availableCategories =
    mode === 'create'
      ? CATEGORIES.circuit
      : intersection(
          uniq(flatten(map(analysisReports, 'categories'))),
          CATEGORIES.circuit
        );

  return (
    <>
      {availableCategories && availableCategories.length > 1 && (
        <div className="categories-filter">
          {mode !== 'create' && <h3>Categories</h3>}
          <p>You may select one or multiple from the list</p>
          <div className="categories">
            {CATEGORIES.circuit
              .filter(o => availableCategories.includes(o))
              .map((object, i) => (
                <Button
                  key={i}
                  type="default"
                  onClick={() => selectCategory(object)}
                  className={`group-buttons ${
                    selectedCategories.includes(object) ? 'active' : ''
                  }`}
                >
                  {object}
                </Button>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryWidget;
