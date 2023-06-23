import React  from 'react';
import DataExplorerContentPage from '../../organisms/DataExplorerGraphFlowContent/DataExplorerGraphFlowContent';
import './styles.less';

const DataExplorerResolverPage = () => {
    return (
        <div className='data-explorer-resolver'>
            <div className="degf__content" >
                <DataExplorerContentPage />
            </div>
        </div>
    );
};

export default DataExplorerResolverPage;
