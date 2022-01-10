import * as React from 'react';
import { Layout } from 'antd';
import '../../../shared/styles/search-tables.less';
import SearchContainer from '../containers/SearchContainer';
import ErrorBoundary from '../components/SearchErrorBoundary';

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

export default GlobalSearchView;
