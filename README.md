# Waste Less Game

A Phaser browser game!

## Available Commands

| Command | Description |
|---------|-------------|
| `yarn install` | Install project dependencies |
| `yarn watch` | Build project and open web server running project, watching for changes |
| `yarn dev` | Builds project and open web server, but do not watch for changes |
| `yarn build` | Builds code bundle with production settings (minification, no source maps, etc..) |

## Configuring Rollup

* Edit the file `rollup.config.dev.js` to edit the development build.
* Edit the file `rollup.config.dist.js` to edit the distribution build.

You will find lots of comments inside the rollup config files to help you do this.

Note that due to the build process involved, it can take around 20 seconds to build the initial bundle. Times will vary based on CPU and local drive speeds. The development config does not minify the code in order to save build time, but it does generate source maps. If you do not require these, disable them in the config to speed it up further.
