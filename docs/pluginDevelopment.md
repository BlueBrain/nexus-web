# Nexus Plugins development

Your plugin need to export a default function with the following signature:

```typescript
export default ({ ref: HTMLElement, nexusClient: NexusClient, resource: Resource<T> }) => {
  return () => {
    // optional callback   when your plugin is unmounted from the page
  };
};
```

Nexus Plugin uses [SystemJS](https://github.com/systemjs/systemjs).

You have to transpile and bundle your code using SystemJS as output:

- with [rollup](https://rollupjs.org/guide/en/#outputformat): use `system` as output format
- with [webpack](https://webpack.js.org/configuration/output/#outputlibrarytarget): use `system` as `outputTarget`
