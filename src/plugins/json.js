const assert = require('assert')
const fs = require('fs')

function PluginJson (methods, filename, { required = true } = {}) {
  Object.assign(this, methods)

  if (required) assert.ok(filename, 'json filename missing')
  if (!filename) return

  this.__filename = filename
  try {
    fs.accessSync(filename, fs.constants.R_OK)
    const data = JSON.parse(fs.readFileSync(filename, 'utf8').toString())
    methods.assign(data)
  } catch (err) {
    if (!required) return
    throw err
  }
}

PluginJson.prototype.save = function (filename) {
  fs.writeFileSync(filename || this.__filename, JSON.stringify(this.toJSON(), null, '\t'))
}

module.exports = PluginJson
