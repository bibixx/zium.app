# Development

To get a local copy up and running follow these steps.

## Prerequisites

* [Node.js 16.18+](https://nodejs.org/en/download)
* [Yarn](https://yarnpkg.com/getting-started/install)

## Installation

### zium.app
1. Clone the repo
   ```sh
   git clone https://github.com/bibixx/zium.app.git
   ```
2. Install NPM packages
   ```sh
   yarn install
   ```
3. Run app in the development mode
   ```sh
   yarn dev
   ```

### Chrome Extension
1. Clone the repo
   ```sh
   git clone https://github.com/bibixx/zium.app.git
   ```
2. Enter the `extension` folder
   ```sh
   cd extension
   ```
2. Install NPM packages
   ```sh
   yarn install
   ```
3. Run extension in the development mode
   ```sh
   yarn dev
   ```
4. [Load the unpacked extension from the `extension/dist` folder](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)

> Domains that the **dev** extension considers the app to be in is: `localhost`, `*.zium.app`, `*.vercel.app`\
> Domains that the **production** (the one in Chrome store) extension considers the app to be in is: `*.zium.app`
