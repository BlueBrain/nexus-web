import * as React from 'react';
import { Layout } from 'antd';
import '../../../shared/styles/search-tables.less';
import SearchContainer from '../containers/SearchContainer';

const { Content } = Layout;

const GlobalSearchView: React.FC = () => {
  return (
    <Content
      style={{
        padding: '1em',
        marginTop: '0',
      }}
    >
      <Layout>
        <Content style={{ marginLeft: '0px', marginTop: '0' }}>
          <SearchContainer />
        </Content>
      </Layout>
    </Content>
  );
};

export default GlobalSearchView;
