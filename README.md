## Getting Started

1. Run `npm install` to install the needed packages
4. Run `npm start` to start up the development server. It should open your system's default browser with the URL and refresh to reflect code changes you make upon save.

### Building

To build the project, run `npm run build` and it will compile everything into a `/dist/` folder. You will either have one `bundle.js` file or multiple that are chunked for performance.

Inside the `/dist/` folder is a dynamically generated `index.html` that uses `/src/index.html` as a base and injects the js files that were created in the process into it.

The `/dist/` folder is self contained so you could drop it onto a server and it will load the index.html or you can take the generated JavaScript file(s) and include them on a different page, as long as you have a container element with the same ID that is specified in `index.js` for React to lock onto and render inside of.

**Note: Please use NPM, not Yarn to prevent multiple lock files.**