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
      // https://github.com/BlueBrain/nexus/issues/2609#issuecomment-906995492
      // the content of the Search bar is not selected properly, bacause <Input /> is wrapped in <Autocmplete />
      // and doesn't have its own value or defaultValue to select
      inputRef.current &&
        inputRef.current.focus({
          cursor: 'all',
        });
      inputRef.current && inputRef.current.input.select();
      e.preventDefault();
    }
  };
  document.addEventListener('keypress', focusSearch);

  return () => {
    document.removeEventListener('keypress', focusSearch);
  };
};
