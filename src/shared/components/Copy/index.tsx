import * as React from 'react';

const DEFAULT_REVERT_DELAY = 3000;

type triggerCopy = () => void;

interface CopyProps {
  textToCopy: string;
  revertDelay?: number;
  render(
    copySuccess: boolean,
    triggerCopy: triggerCopy
  ): React.ReactElement<any>;
}

// https://stackoverflow.com/questions/39501289/in-reactjs-how-to-copy-text-to-clipboard/39504692
const Copy: React.FunctionComponent<CopyProps> = ({
  textToCopy,
  render,
  revertDelay = DEFAULT_REVERT_DELAY,
}) => {
  const [copySuccess, setCopySuccess] = React.useState(false);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCopySuccess(false);
    }, revertDelay);
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Must use browser dom manipulation in order to hide the fake textArea,
  // otherwise must use react references and that's too slow
  const triggerCopy = () => {
    if (document && document.queryCommandSupported('copy')) {
      const textField = document.createElement('textarea');
      textField.innerText = textToCopy;
      document.body.appendChild(textField);
      textField.select();
      document.execCommand('copy');
      textField.remove();
      setCopySuccess(true);
    }
  };

  return render(copySuccess, triggerCopy);
};

export default Copy;
