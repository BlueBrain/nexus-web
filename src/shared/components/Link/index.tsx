import * as React from 'react';

const Link: React.FunctionComponent<{
  goTo: () => void;
  path?: string;
}> = ({ goTo, path, children }) => {
  return path ? (
    <a
      onClick={e => {
        e.preventDefault();
        goTo();
      }}
      href={path}
    >
      {children}
    </a>
  ) : (
    <span>{children}</span>
  );
};

export default Link;
