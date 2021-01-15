export const triggerCopy = (textToCopy: string) => {
  if (document && document.queryCommandSupported('copy')) {
    const textField = document.createElement('textarea');
    console.log(textToCopy);
    textField.innerText = textToCopy;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
  }
};
