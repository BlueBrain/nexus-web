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

  // Regex to match fields starting with an underscore
  const regex = /"\s*_(\w+)"/g;

  lines.forEach((line, index) => {
    if (line.match(regex)) {
      linterErrors.push({
        message: 'Cannot have fields starting with an underscore',
        line: index + 1,
      });
    }
  });

  return linterErrors;
};
