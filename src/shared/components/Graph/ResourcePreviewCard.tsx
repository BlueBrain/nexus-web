import * as React from 'react';

const ResourcePreviewCard: React.FunctionComponent<{
  loading:boolean,
}> = ({ loading }) => {
  console.log('loading....', loading);
  
  return (
    <div style={{
        margin: '30px',
        position: 'absolute',
        bottom: 0,
        right: 0,
        padding: '20px',
        border: '1px solid grey',
        borderRadius: '4px',
        background: 'white',
      }}>
        {loading ? 'Loading...' : <p>Popup!</p>}
        Hello
    </div>
  );
}

export default ResourcePreviewCard;