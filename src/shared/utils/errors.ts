import * as StackTrace from 'stacktrace-js';

/**
 * Gets stack traces using the source map
 */
export const formatError = async (error: Error): Promise<string> => {
  const traces: StackTrace.StackFrame[] = await StackTrace.fromError(error);
  return traces
    .map(
      trace =>
        `at ${trace.functionName} (${trace.fileName}:${trace.lineNumber}:${trace.columnNumber})`
    )
    .join('\n')
    .replace(/^/, `${error.name}: ${error.message}\n`);
};

/**
 * Send an error to Google Analytics if available
 */
export const reportError = async (
  error: Error | string,
  fatal: boolean = false
): Promise<void> => {
  const gtag: (
    command: string,
    hitType: string,
    fieldsObject: {
      description: string;
      fatal?: boolean;
    }
  ) => {} =
    // @ts-ignore
    typeof window.gtag === 'function'
      ? //
        // @ts-ignore
        window.gtag
      : //
        function() {};

  const description =
    typeof error === 'string' ? error : await formatError(error);

  gtag('event', 'exception', {
    description,
    fatal,
  });
};
