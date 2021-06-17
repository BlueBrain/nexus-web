import * as React from 'react';
import { Drawer } from 'antd';

import './ResourceInfoPanel.less';

const ResourceInfoPanel: React.FC<{ typeStats: any; relations: any }> = ({
  typeStats,
  relations,
}) => {
  console.log('relations', relations);

  return (
    <Drawer visible={true} title={typeStats._name} mask={false} width={400}>
      <div className="resource-info-panel">
        <p>{typeStats['@id']}</p>
        <p>{typeStats._count} resources</p>
        <br />
        <h4>Properties (coverage in resources)</h4>
        <ul>
          {typeStats._properties &&
            typeStats._properties.map((property: any) => {
              return (
                <li>
                  <span>
                    {property._name}: {property._count} resources
                  </span>
                  {property._properties && (
                    <ul>
                      {property._properties.map((subProperty: any) => (
                        <li>
                          {subProperty._name}: {subProperty._count} resources
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
        </ul>
        <br />
        <h4>Relationships</h4>
        <ul>
          {relations &&
            relations.map((relation: any) => (
              <li>
                {relation._path.map((path: any) => path._name).join('/')}{' '}
                {'-->'}{' '}
                {relation._source === typeStats['@id']
                  ? relation._target
                  : relation._source}{' '}
              </li>
            ))}
        </ul>
      </div>
    </Drawer>
  );
};

export default ResourceInfoPanel;
