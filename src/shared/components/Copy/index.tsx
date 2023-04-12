import * as React from 'react';
import { triggerCopy } from '../../utils/copy';

const DEFAULT_REVERT_DELAY = 2500;

type triggerCopy = (textToCopy: string) => void;

interface CopyProps {
  revertDelay?: number;
  render(
    copySuccess: boolean,
    triggerCopy: triggerCopy
  ): React.ReactElement<any>;
}

// https://stackoverflow.com/questions/39501289/in-reactjs-how-to-copy-text-to-clipboard/39504692
const Copy: React.FunctionComponent<CopyProps> = ({
  render,
  revertDelay = DEFAULT_REVERT_DELAY,
}) => {
  const [copySuccess, setCopySuccess] = React.useState(false);

  // Must use browser dom manipulation in order to hide the fake textArea,
  // otherwise must use react references and that's too slow
  const handleTriggerCopy = (textToCopy: string) => {
    if (document && document.queryCommandSupported('copy')) {
      triggerCopy(textToCopy);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, revertDelay);
    }
  };

  return render(copySuccess, handleTriggerCopy);
};

export default Copy;
