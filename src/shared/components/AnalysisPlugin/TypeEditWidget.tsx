import * as React from 'react';
import { Radio, Form } from 'antd';
import { intersection } from 'lodash';
import './CategoryTypeEdits.less';
import { TypeEditWidgetProps } from '../../types/plugins/report';
import { changeAnalysisTypes } from '../../slices/plugins/report';
import { REPORT_TYPES as TYPES } from '../../../constants';

const TypesEditWidget = ({
  dispatch,
  currentlyBeingEditedAnalysisReportTypes,
}: TypeEditWidgetProps) => {
  const changeType = ({ target: { value } }: any) => {
    dispatch(changeAnalysisTypes({ types: [value] }));
  };
  const activeTypes = currentlyBeingEditedAnalysisReportTypes
    ? currentlyBeingEditedAnalysisReportTypes
    : [];
  const current = intersection(TYPES, activeTypes)[0];
  return (
    <>
      {TYPES && TYPES.length > 0 && (
        <div style={{ margin: '20px 0' }} className={'typeEdits'}>
          <h4 style={{ marginTop: '10px', color: '#003A8C' }}>Report Type</h4>
          <Form layout={'vertical'}>
            <Form.Item label="" aria-label="Analysis Types">
              {current && (
                <Radio.Group
                  options={TYPES}
                  onChange={changeType}
                  optionType="button"
                  buttonStyle="solid"
                  value={current}
                />
              )}
              {!current && (
                <Radio.Group
                  options={TYPES}
                  onChange={changeType}
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
