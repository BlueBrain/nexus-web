import './CategoryTypeEdits.scss';

import { Form,Radio } from 'antd';
import { intersection } from 'lodash';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'shared/store/reducers';

import { changeAnalysisTypes } from '../../slices/plugins/report';
import { TypeEditWidgetProps } from '../../types/plugins/report';

const TypesEditWidget = ({
  dispatch,
  currentlyBeingEditedAnalysisReportTypes,
}: TypeEditWidgetProps) => {
  const { analysisPluginTypes } = useSelector(
    (state: RootState) => state.config
  );
  const typeLabels = analysisPluginTypes.map(({ label }) => label);

  const changeType = ({ target: { value } }: any) => {
    dispatch(changeAnalysisTypes({ types: [value] }));
  };
  const activeTypes = currentlyBeingEditedAnalysisReportTypes
    ? currentlyBeingEditedAnalysisReportTypes
    : [];
  const current = intersection(typeLabels, activeTypes)[0];
  return (
    <>
      {typeLabels && typeLabels.length > 0 && (
        <div style={{ margin: '20px 0' }} className={'typeEdits'}>
          <h4 style={{ marginTop: '10px', color: '#003a8c' }}>Report Type</h4>
          <Form layout={'vertical'}>
            <Form.Item label="" aria-label="Analysis Types">
              {current && (
                <Radio.Group
                  options={typeLabels}
                  onChange={changeType}
                  optionType="button"
                  buttonStyle="solid"
                  value={current}
                />
              )}
              {!current && (
                <Radio.Group
                  options={typeLabels}
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
