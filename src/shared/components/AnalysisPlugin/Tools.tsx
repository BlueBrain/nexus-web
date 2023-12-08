import { ToolOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import * as React from 'react';

type ToolsProps = {
  tools: { scriptPath: string; description: string }[];
  onAddTool: () => void;
};

const Tools = ({ tools, onAddTool }: ToolsProps) => {
  const [toolDescriptionExpanded, setToolDescriptionExpanded] = React.useState<
    boolean[]
  >();

  React.useEffect(
    () => tools && setToolDescriptionExpanded(tools.map((i, ix) => false)),
    [tools]
  );

  if (tools === undefined || tools.length === 0) {
    return (
      <section>
        <h3>Tools</h3>
        <p>
          Hello there, We are missing the script used to generate this report.
          Fancy helping us making more sense of the following information?
        </p>
        <Button type="primary" className="add-button" onClick={onAddTool}>
          Add tool
          <ToolOutlined />
        </Button>
      </section>
    );
  }

  return (
    <section>
      <h3 style={{ marginTop: '10px', color: '#003a8c' }}>Tools</h3>
      <ul style={{ padding: 0 }}>
        {tools.map((t, ix) => (
          <li
            key={ix}
            style={{
              listStyle: 'none',
              background: '#F5F5F5',
              padding: '26px',
              marginBottom: '8px',
            }}
          >
            <div>
              <div style={{ display: 'flex' }}>
                <div>
                  <h4 style={{ textTransform: 'uppercase', color: '#BFBFBF' }}>
                    Code Repository
                  </h4>
                  <p>
                    {t.scriptPath.startsWith('http') ? (
                      <a
                        style={{ color: '#262626' }}
                        href={t.scriptPath}
                        target="_blank" rel="noreferrer"
                      >
                        {t.scriptPath}&nbsp;&#x2197;
                      </a>
                    ) : (
                      <>{t.scriptPath}</>
                    )}
                  </p>
                </div>
                {t.description && toolDescriptionExpanded && (
                  <Button
                    onClick={() =>
                      setToolDescriptionExpanded(
                        toolDescriptionExpanded.map((expanded, ix2) =>
                          ix === ix2 ? !expanded : expanded
                        )
                      )
                    }
                    style={{ backgroundColor: '#FFFFFF', margin: '0 0 0 auto' }}
                  >
                    Read {toolDescriptionExpanded[ix] ? 'less' : 'more'}
                  </Button>
                )}
              </div>
              {t.description &&
                toolDescriptionExpanded &&
                toolDescriptionExpanded[ix] && (
                  <>
                    <h4
                      style={{ textTransform: 'uppercase', color: '#BFBFBF' }}
                    >
                      How did we run our tool
                    </h4>
                    <p style={{ color: '#262626', whiteSpace: 'pre-wrap' }}>
                      {t.description}
                    </p>
                  </>
                )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Tools;
