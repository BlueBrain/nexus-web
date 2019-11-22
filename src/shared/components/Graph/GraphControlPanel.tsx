import * as React from 'react';
import { Alert, Button } from 'antd';

import { DEFAULT_LAYOUT, LAYOUTS } from './LayoutDefinitions';

import './GraphControlPanel.less';

const GraphControlPanel: React.FunctionComponent<{
    onReset?(): void;
    onCollapse?(): void;
    collapsed?: boolean;
    onLayoutChange?(type: string): void;
    layout?: string;
    loading: boolean;
  }> = ({ onReset, onCollapse, collapsed, onLayoutChange, layout = DEFAULT_LAYOUT, loading }) => {
  const [showAlert, setShowAlert] = React.useState(true);

  const handleLayoutClick = (type: string) => () => {
    onLayoutChange && onLayoutChange(type);
  };
  
  return (
    <div className="graph-control-panel">
      <div className="controls">
        <div>
          {Object.keys(LAYOUTS).map(layoutKey => {
            return (
              <Button
                key={layoutKey}
                size="small"
                type={layoutKey === layout ? 'primary' : 'default'}
                onClick={handleLayoutClick(layoutKey)}
              >
                {LAYOUTS[layoutKey].label}
              </Button>
            );
          })}
        </div>
        <div>
          <Button
            type={collapsed ? 'primary' : 'default'}
            size="small"
            onClick={onCollapse}
          >
            {collapsed ? 'Expand Paths' : 'Collapse Paths'}
          </Button>
          {/* <Button size="small" onClick={onRecenter}>
            Origin
          </Button> */}
          <Button size="small" onClick={onReset}>
            Reset
          </Button>
        </div>
      </div>
      {showAlert ? (
        <Alert
          style={{ margin: '7px 5px 0 0' }}
          message="Click and hold to visit a resource"
          type="info"
          closable
          afterClose={() => setShowAlert(false)}
        />
      ) : null}
      {loading && (
        <Alert
          style={{ margin: '7px 5px 0 0' }}
          message="Loading..."
          type="info"
        />
      )}
    </div>
  );
}

export default GraphControlPanel;