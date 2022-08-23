<<<<<<< HEAD
import * as React from 'react'
import { Button } from 'antd'
import { flatten, map, uniq, intersection } from 'lodash'
import { InfoCircleOutlined } from '@ant-design/icons'
import './Categories.less'
import { CategoryWidgetProps } from '../../types/plugins/report'

import { REPORT_CATEGORIES as CATEGORIES } from '../../../constants'
=======
import * as React from 'react';
import { Button } from 'antd';
import { flatten, map, uniq, intersection } from 'lodash';
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
>>>>>>> 2ae36754 (continueing to divide components so we can manage a different view for the new report)

const CategoryWidget = ({
  dispatch,
  analysisReports,
  selectedCategories,
  mode,
  selectCategory,
}: CategoryWidgetProps) => {
  const [openPanel, setOpenPanel] = React.useState<number>()

  const availableCategories =
    mode === 'create'
      ? CATEGORIES.circuit
      : intersection(
<<<<<<< HEAD
<<<<<<< HEAD
          uniq(flatten(map(analysisReports, 'categories'))),
          CATEGORIES.circuit
        )

  return (
    <>
      {availableCategories && availableCategories.length > 0 && (
        <div className='categories'>
          {mode !== 'create' && <h3>Categories</h3>}
          <p>you may select one or multiple from the list</p>
          {CATEGORIES.circuit
            .filter(o => availableCategories.includes(o))
            .map((object, i) => (
              <Button
                key={i}
                type='default'
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
      )}
    </>
  )
}
=======
          uniq(flatten(map(analysisReports, 'containerCategory'))),
=======
          uniq(flatten(map(analysisReports, 'categories'))),
>>>>>>> 4cfff0c0 (save from new screen working)
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
>>>>>>> 2ae36754 (continueing to divide components so we can manage a different view for the new report)

export default CategoryWidget
