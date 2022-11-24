import * as React from 'react';
import { triggerCopy } from '../../utils/copy';
declare type triggerCopy = (textToCopy: string) => void;
interface CopyProps {
  revertDelay?: number;
  render(
    copySuccess: boolean,
    triggerCopy: triggerCopy
  ): React.ReactElement<any>;
}
declare const Copy: React.FunctionComponent<CopyProps>;
export default Copy;
