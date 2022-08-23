import * as React from 'react';
import { Button } from 'antd';
import { without, flatten, map, uniq, intersection } from 'lodash';
import { FolderAddOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './Categories.less';
import {
  ActionType,
  AnalysesAction,
} from '../../../shared/containers/AnalysisPlugin/AnalysisPluginContainer';

import { AnalysisReport } from '../../../shared/components/AnalysisPlugin/AnalysisPlugin';

const CATEGORIES = {
  circuit: [
    'Anatomical',
    'Connectivity',
    'Volumetric',
    'Morphometric',
    'Synapse',
  ],
  simulation: ['Spiking', 'Soma voltage', 'LFP', 'VSD', 'Plasticity'],
};

type CategoryWidgetProps = {
  analysisReports?: AnalysisReport[];
  mode: 'view' | 'edit' | 'create';
  selectedCategories: string[];
  selectCategory: (value: string) => void;
  dispatch: (action: AnalysesAction) => void;
};

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
          uniq(flatten(map(analysisReports, 'containerCategory'))),
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
              dispatch({
                type: ActionType.ADD_ANALYSIS_REPORT,
              });
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
