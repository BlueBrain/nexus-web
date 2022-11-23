import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Layout } from 'antd';
import '../../../shared/styles/search-tables.less';
import SearchContainer from '../subapps/search/containers/SearchContainer';
import ErrorBoundary from '../subapps/search/components/SearchErrorBoundary';

const { Content } = Layout;

const GlobalSearchView: React.FC = () => {
  return (
    <ErrorBoundary>
      <Content
        style={{
          padding: '1em',
          marginTop: '0',
        }}
      >
        <Layout>
          <Content style={{ marginLeft: '0px', marginTop: '0' }}>
            <SearchContainer />
            <div
              className="tooltipContainer"
              style={{
                position: 'fixed',
                top: '0',
                right: '200',
                zIndex: 999,
              }}
            ></div>
          </Content>
        </Layout>
      </Content>
    </ErrorBoundary>
  );
};

// export default GlobalSearchView;

class StandaloneComponent extends HTMLElement {
  mountPoint!: HTMLSpanElement;

  connectedCallback() {
    const mountPoint = document.createElement('span');
    this.attachShadow({ mode: 'open' }).appendChild(mountPoint);

    ReactDom.render(<GlobalSearchView />, mountPoint);
  }
}
export default StandaloneComponent;

window.customElements.get('standalone-component') ||
  window.customElements.define('standalone-component', StandaloneComponent);