
import graphNodes from '../../images/graphNodes.svg';

const DataExplorerGraphFlowEmpty = () => {
  return (
    <div className="data-explorer-resolver no-current">
      <div className="empty">
        <img
          src={graphNodes}
          alt="nodes"
          style={{ width: 500 }}
        />
        <div className="empty__title">No data explorer graph flow</div>
        <div className="empty__subtitle">
          Please select a node from any resource view editor to start exploring
        </div>
      </div>
    </div>
  );
};

export default DataExplorerGraphFlowEmpty;
