import * as React from 'react';
import { Radio, Form } from 'antd';
import { intersection } from 'lodash';
import './Categories.less';
import { TypeEditWidgetProps } from '../../types/plugins/report';

import { REPORT_TYPES as TYPES } from '../../../constants';

const TypesEditWidget = ({
  dispatch,
  currentlyBeingEditedAnalysisReportTypes,
}: TypeEditWidgetProps) => {
  const onChange1 = ({ target: { value } }: any) => {
    console.log('radio1 checked', value);
  };
  const activeTypes = currentlyBeingEditedAnalysisReportTypes
    ? currentlyBeingEditedAnalysisReportTypes
    : [];
  const current = intersection(TYPES, activeTypes)[0];
  console.log(
    'TYPES EDIT WIDGET, selectedtypes, current',
    activeTypes,
    current
  );
  return (
    <>
      {TYPES && TYPES.length > 0 && (
        <div style={{ margin: '20px 0' }}>
          <Form layout={'vertical'}>
            <Form.Item label="Report Types" aria-label="Analysis Types">
              {current && (
                <Radio.Group
                  options={TYPES}
                  onChange={onChange1}
                  optionType="button"
                  buttonStyle="solid"
                  value={current}
                />
              )}
              {!current && (
                <Radio.Group
                  options={TYPES}
                  onChange={onChange1}
                  optionType="button"
                  buttonStyle="solid"
                />
              )}
            </Form.Item>
          </Form>
        </div>
      )}
    </>
  );
};

export default TypesEditWidget;
