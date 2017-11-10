function PluginEnv ({ get, set, has, assign }) {
  for (const k in process.env) {
    set(k, process.env[k])
  }
}

module.exports = PluginEnv
