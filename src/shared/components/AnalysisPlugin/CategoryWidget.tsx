import * as React from 'react';
import { Button, Tooltip } from 'antd';
import './Categories.scss';
import { CategoryWidgetProps } from '../../types/plugins/report';
import { InfoCircleOutlined } from '@ant-design/icons';

const CategoryWidget = ({
  allCategories,
  availableCategories,
  selectedCategories,
  mode,
  toggleSelectCategory: selectCategory,
}: CategoryWidgetProps) => {
  const categoriesToDisplay =
    mode === 'create' || availableCategories === undefined
      ? allCategories
      : availableCategories;

  return (
    <>
      {categoriesToDisplay && categoriesToDisplay.length > 1 && (
        <div className="categories-filter">
          {mode !== 'create' && <h3>Categories</h3>}
          <p>You may select one or multiple from the list</p>
          <div className="categories">
            {categoriesToDisplay.map((cat, i) => (
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
