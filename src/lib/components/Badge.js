import React from 'react';

const Badge = (props) => {
   return (
      <div className={`badge ${!props.value ? 'badge--none' :''} `}>
        <h4 className="heavy">{props.value || 0}</h4>
      </div>
     )
}

export default Badge;