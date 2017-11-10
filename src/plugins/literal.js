function PluginLiteral ({ get, set, has, assign }, initialData) {
  Object.assign(this, { get, set, has, assign })
  if (initialData) assign(initialData)
}

module.exports = PluginLiteral
