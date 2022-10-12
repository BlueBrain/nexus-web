import { Button, Tooltip } from 'antd';
import { flatten, map, uniq, intersection } from 'lodash';
import './Categories.less';

import { TypeWidgetProps } from '../../types/plugins/report';
import { useSelector } from 'react-redux';
import { RootState } from 'shared/store/reducers';
import { InfoCircleOutlined } from '@ant-design/icons';

const TypeWidget = ({
  dispatch,
  analysisReports,
  selectedTypes,
  mode,
  selectType,
}: TypeWidgetProps) => {
  const { analysisPluginTypes } = useSelector(
    (state: RootState) => state.config
  );
  const typeLabels = analysisPluginTypes.map(({ label }) => label);

  const availableTypes =
    mode === 'create'
      ? typeLabels
      : intersection(uniq(flatten(map(analysisReports, 'types'))), typeLabels);

  return (
    <>
      {availableTypes && availableTypes.length > 1 && (
        <div className="types-filter">
          {mode !== 'create' && <h3>Types</h3>}
          <p>You may select one or multiple from the list</p>
          {analysisPluginTypes
            .filter(reportType => availableTypes.includes(reportType.label))
            .map((reportType, i) => (
              <Button
                key={i}
                type="default"
                onClick={() => selectType(reportType.label)}
                className={`group-buttons ${
                  selectedTypes.includes(reportType.label) ? 'active' : ''
                }`}
              >
                {reportType.label}
                <Tooltip title={reportType.description}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Button>
            ))}
        </div>
      )}
    </>
  );
};

export default TypeWidget;
