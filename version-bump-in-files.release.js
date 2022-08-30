/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
var v = require('./package.json').version

const replace = require('replace-in-file')

// Match semver like 'v0.0.1' or even 'v0.0.1-alpha'
const regex = new RegExp(/v[0-9]+\.[0-9]+\.[0-9]*.*(?=\s)/, 'i')

const options = {
    files: 'README.md',
    from: regex,
    to: "v" + v,
}

replace.sync(options)