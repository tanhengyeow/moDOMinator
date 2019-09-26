# moDOMinator

A JavaScript module that scans modern front-end applications for web vulnerabilities.

# Installation

Using npm:

```
$ npm i modominator
```

# Usages

This module can be used standalone or incorporated in custom tools.

1. Standalone

Refer to [moDOMinator-example-apps](https://github.com/tanhengyeow/moDOMinator-example-apps) for examples. Directories with `(standalone)` show how you can use the module by installing it as a npm package.

Pros of this approach:
- Suitable to test smaller scale websites made up of a few components with little dynamic content.

Cons of this approach:
- There is little support for state changes. When the app's state changed, DOM elements that are scanned might be repeated or left out (e.g. due to page redirection). As a result, the outcome might not be deterministic as it depends on how the app is written.
- The module has to be included manually in every component that wish to be scanned.

2. Custom

Refer to [moDOMinator-example-apps](https://github.com/tanhengyeow/moDOMinator-example-apps) for examples. Directories with `(custom)` show how you can use the module in your custom tool to scan for web vulnerabilities. The example apps in the repository uses [moDOMinator-chrome-extension](https://github.com/tanhengyeow/moDOMinator-chrome-extension).

Pros of this approach:
- Flexible and customizable to your needs.
- The custom tool may act as an entity to detect state changes to the app, identify new DOM elements rendered and use the module to scan the DOM elements for web vulnerabilities. See how [moDOMinator-chrome-extension](https://github.com/tanhengyeow/moDOMinator-chrome-extension) do this.

Cons of this approach:
- Users have to code the custom tool from scratch if they are not using [moDOMinator-chrome-extension](https://github.com/tanhengyeow/moDOMinator-chrome-extension).

**-Work in Progress-**
