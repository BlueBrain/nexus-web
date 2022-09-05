import { Button } from 'antd';
import { flatten, map, uniq, intersection } from 'lodash';
import { InfoCircleOutlined } from '@ant-design/icons';
import './Categories.less';

import { TypeWidgetProps } from '../../types/plugins/report';

import { REPORT_TYPES as TYPES } from '../../../constants';

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
      : intersection(uniq(flatten(map(analysisReports, 'types'))), TYPES);

  return (
    <>
      {availableTypes && availableTypes.length > 0 && (
        <div className="types">
          {mode !== 'create' && <h3>Types</h3>}
          <p>you may select one or multiple from the list</p>
          {TYPES.filter(o => availableTypes.includes(o)).map((object, i) => (
            <Button
              key={i}
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
      )}
    </>
  );
};

export default TypeWidget;
