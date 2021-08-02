export const focusOnSlash = (focused: boolean, inputRef: any) => {
  const focusSearch = (e: KeyboardEvent) => {
    // only focus the search bar if there's no currently focused input element
    // or if there's not a modal
    if (
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLSelectElement ||
      document.querySelectorAll("[class*='modal']").length
    ) {
      return;
    }

    if (e.key === '/' && !focused) {
      inputRef.current && inputRef.current.focus();
      inputRef.current && inputRef.current.input.select();
      e.preventDefault();
    }
  };
  document.addEventListener('keypress', focusSearch);

  return () => {
    document.removeEventListener('keypress', focusSearch);
  };
};
