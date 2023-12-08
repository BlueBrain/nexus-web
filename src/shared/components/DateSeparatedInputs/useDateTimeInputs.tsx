import * as React from 'react';

const isSelectionStart = (el: HTMLInputElement) => el.selectionStart === 0 && el.selectionEnd === 0;

const isSelectionEnd = (el: HTMLInputElement) =>
  el.selectionStart === el.value.length && el.selectionEnd === el.value.length;

export const isSelectionEmpty = (el: HTMLInputElement) => el.selectionStart === el.selectionEnd;
const isKeySeparator = (key: string): key is '/' => key === '/';
const isKeyArrowLeft = (key: string): key is 'ArrowLeft' => key === 'ArrowLeft';
const isKeyArrowRight = (key: string): key is 'ArrowRight' => key === 'ArrowRight';
const isKeyBackspace = (key: string): key is 'Backspace' => key === 'Backspace';
const isKeyDelete = (key: string): key is 'Delete' => key === 'Delete';
const focus = (el: HTMLElement) => {
  el.focus();
};

const focusStart = (el: HTMLInputElement) => {
  el.focus();
  el.selectionStart = 0;
  el.selectionEnd = 0;
};

const focusEnd = (el: HTMLInputElement) => {
  el.focus();
  el.selectionStart = el.value.length;
  el.selectionEnd = el.value.length;
};
const isInputEmpty = (input: HTMLInputElement) => input.value.length === 0;

const isInputFull = (input: HTMLInputElement) => input.value.length >= input.maxLength;
const isKeyNumeric = (
  key: string
): key is '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' =>
  key === '0' ||
  key === '1' ||
  key === '2' ||
  key === '3' ||
  key === '4' ||
  key === '5' ||
  key === '6' ||
  key === '7' ||
  key === '8' ||
  key === '9';
const trackInputPart = ({
  inputPrev,
  inputCurrent,
  inputNext,
}: {
  inputPrev: HTMLInputElement | null | undefined;
  inputCurrent: HTMLInputElement;
  inputNext: HTMLInputElement | null | undefined;
}) => {
  const onKeyDown = (e: KeyboardEvent) => {
    const { key } = e;
    const currentTarget = e.currentTarget as HTMLInputElement;
    if (isKeyBackspace(key) && isSelectionStart(currentTarget) && inputPrev) {
      focusEnd(inputPrev);
      return;
    }
    if (isKeyDelete(key) && isSelectionEnd(currentTarget) && inputNext) {
      focusStart(inputNext);
      return;
    }
    if (isKeyArrowLeft(key) && isSelectionStart(currentTarget) && inputPrev) {
      e.preventDefault();
      focusEnd(inputPrev);
      return;
    }
    if (isKeyArrowRight(key) && isSelectionEnd(currentTarget) && inputNext) {
      e.preventDefault();
      focusStart(inputNext);
      return;
    }
  };

  const onKeyPress = (e: KeyboardEvent) => {
    const { key } = e;
    const currentTarget = e.currentTarget as HTMLInputElement;
    if (isKeySeparator(key)) {
      e.preventDefault();
      if (!isInputEmpty(currentTarget) && isSelectionEmpty(currentTarget) && inputNext) {
        focus(inputNext);
      }
      return;
    }
    if (isKeyNumeric(key)) {
      if (
        isSelectionEnd(currentTarget) &&
        isInputFull(currentTarget) &&
        inputNext &&
        !isInputFull(inputNext)
      ) {
        focusStart(inputNext);
      }
      return;
    }
    e.preventDefault();
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const { key } = e;
    const currentTarget = e.currentTarget as HTMLInputElement;
    if (
      isKeyNumeric(key) &&
      isSelectionEnd(currentTarget) &&
      isInputFull(currentTarget) &&
      inputNext &&
      !isInputFull(inputNext)
    ) {
      focusStart(inputNext);
      return;
    }
  };

  inputCurrent.addEventListener('keydown', onKeyDown);
  inputCurrent.addEventListener('keypress', onKeyPress);
  inputCurrent.addEventListener('keyup', onKeyUp);
  return () => {
    inputCurrent.removeEventListener('keydown', onKeyDown);
    inputCurrent.removeEventListener('keypress', onKeyPress);
    inputCurrent.removeEventListener('keyup', onKeyUp);
  };
};

const useDateTimeInputs = ({
  dayRef,
  monthRef,
  yearRef,
}: {
  dayRef: React.RefObject<HTMLInputElement>;
  monthRef: React.RefObject<HTMLInputElement>;
  yearRef: React.RefObject<HTMLInputElement>;
}) => {
  const refs = [dayRef, monthRef, yearRef];
  React.useEffect(() => {
    refs.forEach((item, index, oldRefs) => {
      if (item.current) {
        trackInputPart({
          inputCurrent: item.current,
          inputPrev: oldRefs[index - 1]?.current,
          inputNext: oldRefs[index + 1]?.current,
        });
      }
    });
  }, [refs]);
};

export default useDateTimeInputs;
