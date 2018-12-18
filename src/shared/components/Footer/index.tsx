import * as React from 'react';
import { Icon } from 'antd';
import './Footer.less';

export interface FooterProps {
  version?: string;
  githubIssueURL?: string;
  children?: React.ReactChild;
}

const Footer: React.FunctionComponent<FooterProps> = ({
  children,
  githubIssueURL,
  version,
}) => {
  return (
    <footer className="footer-bar">
      {version && <span className="footerlet">version {version}</span>}
      {githubIssueURL && (
        <span className="footerlet">
          <a href={githubIssueURL}>
            <Icon type="github" /> post an issue on github
          </a>
        </span>
      )}
      {children}
    </footer>
  );
};

export default Footer;
