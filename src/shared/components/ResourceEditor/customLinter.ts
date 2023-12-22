/**
 * Represents an issue identified by the linter.
 */
export type LinterIssue = {
  /** A message describing the issue. */
  message: string;
  /** The line number where the issue occurs. */
  line: number;
};

/**
 * A custom linter function that checks for issues in a given text.
 *
 * The function specifically looks for fields in the text that start with an underscore,
 * which are considered as errors according to the linter's rules.
 *
 * @param text The text to be linted.
 * @returns An array of LinterIssue objects, each representing a specific issue found in the text.
 */
export const customLinter = (text: string): LinterIssue[] => {
  const linterErrors: LinterIssue[] = [];
  const lines = text.split('\n');

  // Regex to match keys starting with an underscore followed by any character except a space or double quote
  const regex = /"\s*_[^"\s]+"\s*:/g;

  lines.forEach((line, index) => {
    if (regex.test(line)) {
      linterErrors.push({
        message:
          'Fields starting with an underscore are reserved for internal use',
        line: index + 1,
      });
    }
  });

  return linterErrors;
};
