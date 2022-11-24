import * as React from 'react';
import { Identity } from '@bbp/nexus-sdk';
import './ACLs.less';
interface ACLViewProp {
  identity: Identity;
  permissions: string[];
}
declare const ACLCard: React.FunctionComponent<ACLViewProp>;
export default ACLCard;
