import Handlebars from 'handlebars';
import * as Showdown from 'showdown';

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

// Handlerbar helpers
export const convertMarkdownHandlebarStringWithData = (markdown: string, data: object) =>
  converter.makeHtml(Handlebars.compile(markdown)(data));
