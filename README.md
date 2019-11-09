# moDOMinator

A JavaScript module that automatically scans front-end web applications for web vulnerabilities.

# Installation

Using npm: `npm i modominator`

Using Yarn: `yarn add modominator`

# Usage

All you need to do is to import the module in the entry point of your application, using `import 'modominator';`.

moDOMinator will automatically initialize itself when the DOM content has been loaded.
This includes setting up the scanners and hooks necessary for the detection of document changes and HTTP requests.

# Examples

If you wish to see examples of the types of vulnerabilities that moDOMinator can detect, you should refer to
[moDOMinator-example-apps](https://github.com/tanhengyeow/moDOMinator-example-apps).

moDOMinator-example-apps consist of several simple front-end applications built using modern web frameworks such
as React, Vue.js, and Angular. These sample applications are all vulnerable to a variety of attacks, including
various forms of Cross-Site Scripting and CSS Injection.
