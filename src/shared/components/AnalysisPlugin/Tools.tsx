import * as React from 'react';

type ToolsProps = {
  tools: { scriptPath: string; description: string }[];
};

const Tools = ({ tools }: ToolsProps) => {
  return (
    <section>
      <h3>Tools</h3>
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
              <h4 style={{ textTransform: 'uppercase', color: '#BFBFBF' }}>
                Code Repository
              </h4>
              <p>
                {t.scriptPath.startsWith('http') ? (
                  <a
                    style={{ color: '#262626' }}
                    href={t.scriptPath}
                    target="_blank"
                  >
                    {t.scriptPath}&nbsp;&#x2197;
                  </a>
                ) : (
                  <>{t.scriptPath}</>
                )}
              </p>
              {t.description && (
                <>
                  <h4 style={{ textTransform: 'uppercase', color: '#BFBFBF' }}>
                    How did we run our tool
                  </h4>
                  <p style={{ color: '#262626' }}>{t.description}</p>
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
