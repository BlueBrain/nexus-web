import * as React from 'react';
import { Button } from 'antd';
import { without, flatten, map, uniq, intersection } from 'lodash';
import { FolderAddOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './Categories.less';
import {
  ActionType,
  AnalysesAction,
} from '../../containers/AnalysisPlugin/AnalysisPluginContainer';

import { AnalysisReport } from './AnalysisPlugin';

const TYPES = ['Validation', 'Prediction', 'Analysis'];

type TypeWidgetProps = {
  analysisReports?: AnalysisReport[];
  mode: 'view' | 'edit' | 'create';
  selectedTypes: string[];
  selectType: (value: string) => void;
  dispatch: (action: AnalysesAction) => void;
};

const TypeWidget = ({
  dispatch,
  analysisReports,
  selectedTypes,
  mode,
  selectType,
}: TypeWidgetProps) => {

  const availableTypes =
    mode === 'create'
      ? TYPES
      : intersection(
          uniq(flatten(map(analysisReports, 'containerType'))),
          TYPES
        );

  return (
    <div className="types">
      {mode !== 'create' && (
        <h3>
          Types
        </h3>)}
      <p>you may select one or multiple from the list</p>
      {TYPES.filter(o => availableTypes.includes(o)).map((object, i) => (
        <Button
          type="default"
          onClick={() => selectType(object)}
          className={`group-buttons ${
            selectedTypes.includes(object) ? 'active' : ''
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

export default TypeWidget;
