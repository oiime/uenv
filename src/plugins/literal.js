function PluginLiteral (methods, initialData) {
  Object.assign(this, methods)
  if (initialData) methods.assign(initialData)
}

module.exports = PluginLiteral
