import { Button, Tooltip } from 'antd';
import './Categories.scss';

import { TypeWidgetProps } from '../../types/plugins/report';
import { InfoCircleOutlined } from '@ant-design/icons';

const TypeWidget = ({
  allTypes,
  availableTypes,
  selectedTypes,
  mode,
  toggleSelectType,
}: TypeWidgetProps) => {
  const typesToDisplay =
    mode === 'create' || availableTypes === undefined
      ? allTypes
      : availableTypes;
  return (
    <>
      {typesToDisplay && typesToDisplay.length > 1 && (
        <div className="types-filter">
          {mode !== 'create' && <h3>Types</h3>}
          <p>You may select one or multiple from the list</p>
          {typesToDisplay.map((reportType, i) => (
            <Button
              key={i}
              type="default"
              onClick={() => toggleSelectType(reportType.label)}
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
