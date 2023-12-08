import './GraphControlPanel.scss';

import { DownOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';
import * as React from 'react';

import { downloadCanvasAsImage } from '../../utils/download';
import { DEFAULT_LAYOUT, LAYOUTS } from './LayoutDefinitions';

const GraphControlPanel: React.FunctionComponent<{
  label: string;
  onReset?(): void;
  onCollapse?(): void;
  collapsed?: boolean;
  onLayoutChange?(type: string): void;
  layout?: string;
  loading: boolean;
  onRecenter?(): void;
}> = ({
  label,
  onReset,
  onCollapse,
  collapsed,
  onLayoutChange,
  layout = DEFAULT_LAYOUT,
  loading,
  onRecenter,
}) => {
  const [showAlert, setShowAlert] = React.useState(true);

  const handleLayoutClick = (type: string) => () => {
    onLayoutChange && onLayoutChange(type);
  };

  const handleDownload = () => {
    const canvas = document.querySelector(
      'canvas[data-id="layer2-node"]' // cytoscape canvas
    ) as HTMLCanvasElement;
    if (canvas) {
      downloadCanvasAsImage(`${label} Graph`, canvas);
    }
  };

  return (
    <div className="graph-control-panel">
      <div className="controls">
        <div>
          {Object.keys(LAYOUTS).map((layoutKey) => {
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
          <Button icon={<DownOutlined />} size="small" onClick={handleDownload}>
            Save Image
          </Button>
          <Button type={collapsed ? 'primary' : 'default'} size="small" onClick={onCollapse}>
            {collapsed ? 'Expand Paths' : 'Collapse Paths'}
          </Button>
          <Button size="small" onClick={onRecenter}>
            Origin
          </Button>
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
      {loading && <Alert style={{ margin: '7px 5px 0 0' }} message="Loading..." type="info" />}
    </div>
  );
};

export default GraphControlPanel;
