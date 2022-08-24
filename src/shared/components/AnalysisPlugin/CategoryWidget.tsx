import * as React from 'react';
import { Button } from 'antd';
import { flatten, map, uniq, intersection } from 'lodash';
import { FolderAddOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './Categories.less';
import {
  CategoryWidgetProps,
} from '../../types/plugins/report';

import { REPORT_CATEGORIES as CATEGORIES } from '../../../constants';

import {
  addReport,
} from '../../slices/plugins/report';

const CategoryWidget = ({
  dispatch,
  analysisReports,
  selectedCategories,
  mode,
  selectCategory,
}: CategoryWidgetProps) => {
  const [openPanel, setOpenPanel] = React.useState<number>();

  const availableCategories =
    mode === 'create'
      ? CATEGORIES.circuit
      : intersection(
          uniq(flatten(map(analysisReports, 'categories'))),
          CATEGORIES.circuit
        );

  return (
    <div className="categories">
      {mode !== 'create' && (
        <h3>
          Categories
          <Button
            type="primary"
            title="Add Analysis Report"
            aria-label="Add Analysis Report"
            onClick={() => {
              dispatch(addReport());
            }}
          >
            Add Report
            <FolderAddOutlined />
          </Button>
        </h3>
      )}
      <p>you may select one or multiple from the list</p>
      {CATEGORIES.circuit
        .filter(o => availableCategories.includes(o))
        .map((object, i) => (
          <Button
            type="default"
            onClick={() => selectCategory(object)}
            className={`group-buttons ${
              selectedCategories.includes(object) ? 'active' : ''
            }`}
          >
            <h5>
              {object}
              <InfoCircleOutlined />
            </h5>
          </Button>
        ))}
    </div>
  );
};

export default CategoryWidget;
