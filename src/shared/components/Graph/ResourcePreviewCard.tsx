import * as React from 'react';

const ResourcePreviewCard: React.FunctionComponent<{}> = () => {
  return (
    <div style={{
        margin: '10px 15px',
        position: 'absolute',
        padding: '20px',
        border: '1px solid grey',
        borderRadius: '4px',
        background: 'white',
      }}>
        Popup!
    </div>
  );
}

export default ResourcePreviewCard;