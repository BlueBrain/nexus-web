// import { Popover } from 'antd';
// import * as React from 'react';
// import ResourceCardComponent from '../../../shared/components/ResourceCard';
// import TypesIconList from '../../../shared/components/Types/TypesIcon';

// const RESOURCE_CARD_MOUSE_ENTER_DELAY = 0.5;

// const makeResourceUri = (id: string) => id;

// const goToResource = (id: string) => {};

// const ResultsComponent: React.FC = () => {
//   return null;
// };

// const ResultsList: React.FC = ({ resource }) => {
//   return resources.map(resource => {
//     return (
//       <a
//         href={makeResourceUri(resource['@id'])}
//         key={resource['@id']}
//         onClick={e => {
//           e.preventDefault();
//           goToResource(resource['@id']);
//         }}
//       >
//         <ListItem
//           key={resource['@id']}
//           onClick={() => goToResource(resource['@id'])}
//         >
//           <Popover
//             content={
//               <div style={{ width: 600 }}>
//                 <ResourceCardComponent
//                   resource={resource}
//                   schemaLink={schemaLinkContainer}
//                 />
//               </div>
//             }
//             mouseEnterDelay={RESOURCE_CARD_MOUSE_ENTER_DELAY}
//           >
//             {getResourceLabel(resource)}
//             {!!resource['@type'] &&
//               (Array.isArray(resource['@type']) ? (
//                 <TypesIconList type={resource['@type']} />
//               ) : (
//                 <TypesIconList type={[resource['@type']]} />
//               ))}
//           </Popover>
//         </ListItem>
//       </a>
//     );
//   });
// };
