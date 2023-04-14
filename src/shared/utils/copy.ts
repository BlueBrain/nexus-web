export const triggerCopy = (textToCopy: string) => {
  if (document && document.queryCommandSupported('copy')) {
    const textField = document.createElement('textarea');
    textField.value = textToCopy; // The `value` property of `textField` is set here instead of `innerText` to allow copying multiline strings to clipboard
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
  }
};
