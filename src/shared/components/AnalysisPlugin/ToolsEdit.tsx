import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Input, Tooltip } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import * as React from 'react';
import './ToolsEdit.less';

type ToolsEditProps = {
  tools: { scriptPath: string; description: string }[];
  onUpdateTools: (tools: { scriptPath: string; description: string }[]) => void;
};

const ToolsEdit = ({ tools, onUpdateTools }: ToolsEditProps) => {
  return (
    <div className="tools-edit">
      <p className="smallInfo">
        Include links to scripts that were used to generate the contents of the
        report
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {tools.map((g, ix) => (
          <li key={ix} style={{ margin: 0, padding: 0 }}>
            <div>
              <label>
                Script Location{' '}
                <Tooltip title="URL to the location of your script ideally pointing to a specific revision">
                  <InfoCircleOutlined />
                </Tooltip>
                <Input
                  placeholder="http://github.com/..."
                  type="text"
                  aria-label="Script location"
                  value={g.scriptPath}
                  onChange={v =>
                    onUpdateTools(
                      tools.map((r, ix2) => {
                        if (ix === ix2) {
                          return { ...r, scriptPath: v.target.value };
                        }
                        return r;
                      })
                    )
                  }
                />
              </label>
            </div>

            <div style={{ marginTop: '10px' }}>
              <label>
                How did you run the script?{' '}
                <Tooltip title="Any specific guidance for how the script was run">
                  <InfoCircleOutlined />
                </Tooltip>
                <TextArea
                  rows={4}
                  value={g.description}
                  onChange={v =>
                    onUpdateTools(
                      tools.map((r, ix2) => {
                        if (ix === ix2) {
                          return {
                            ...r,
                            description: v.target.value,
                          };
                        }
                        return r;
                      })
                    )
                  }
                />
              </label>
            </div>
            <div style={{ width: '100%', display: 'flex' }}>
              <Button
                onClick={e => {
                  e.preventDefault();
                  onUpdateTools(tools.filter((r, ix2) => ix !== ix2));
                }}
                style={{ margin: '4px 0 0 auto' }}
              >
                Remove Tool
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button
        aria-label="Add tool"
        type="primary"
        htmlType="submit"
        className="add-button"
        size="middle"
        onClick={e => {
          e.preventDefault();
          onUpdateTools([...tools, { scriptPath: '', description: '' }]);
        }}
      >
        Add
      </Button>
    </div>
  );
};

export default ToolsEdit;
