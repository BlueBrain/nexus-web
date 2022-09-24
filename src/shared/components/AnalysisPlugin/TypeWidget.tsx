import { Button } from 'antd';
import { flatten, map, uniq, intersection } from 'lodash';
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
      {availableTypes && availableTypes.length > 1 && (
        <div className="types-filter">
          {mode !== 'create' && <h3>Types</h3>}
          <p>You may select one or multiple from the list</p>
          {TYPES.filter(o => availableTypes.includes(o)).map((object, i) => (
            <Button
              key={i}
              type="default"
              onClick={() => selectType(object)}
              className={`group-buttons ${
                selectedTypes.includes(object) ? 'active' : ''
              }`}
            >
              {object}
            </Button>
          ))}
        </div>
      )}
    </>
  );
};

export default TypeWidget;
