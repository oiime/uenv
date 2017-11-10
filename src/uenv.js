const assert = require('assert')
const PluginLiteral = require('./plugins/literal')
const PluginEnv = require('./plugins/env')
const PluginJson = require('./plugins/json')

function UEnv () {
  this.__props = {}
  this.__options = {
    separator: '.'
  }
  this.__references = new Map()
  this.__sealed = new Set()
  this.__plugins = {}
}

UEnv.prototype.assign = function (obj) {
  for (let k in obj) {
    this.set(k, obj[k])
  }
}

UEnv.prototype.set = function (k, v, { references = true } = {}) {
  if (this.__sealed.has(k)) return

  // key is being overwritten, remove references first
  if (this.has(k)) {
    this.__removeReferences(k)
  }

  const leafs = k.split(this.__options.separator)
  const last = leafs.pop()

  let props = this.__props
  let position = ''

  while (leafs.length > 0) {
    const leaf = leafs.shift()
    position = position + ((position.length > 0 && this.__options.separator) || '') + leaf
    let obj
    if (!props.hasOwnProperty(leaf)) {
      obj = {}
      // we need to backtrace references here
      this.set(position, obj, { references: true })
    } else {
      obj = props[leaf]
    }
    props[leaf] = obj
    props = props[leaf]
  }

  props[last] = v
  this.__setReferences(k, props[last], { references })
}

UEnv.prototype.seal = function (k) {
  const v = this.get(k)
  if (!v) return
  if (this.__isPlainObject(v)) {
    this.set(k, Object.seal(v))
  }
  this.__sealed.add(k)
}

UEnv.prototype.setOptions = function (options) {
  Object.assign(this.__options, options)
}

UEnv.prototype.get = function (k, v) {
  return this.__references.get(k)
}

UEnv.prototype.any = function (keys = []) {
  for (const key of keys) {
    if (this.has(key)) return this.get(key)
  }
}

UEnv.prototype.pick = function (key, properties = []) {
  const value = this.get(key)
  const picked = {}
  if (!value || !this.__isPlainObject(value)) return {}
  for (const property of properties) {
    if (!value.hasOwnProperty(property)) continue
    picked[property] = value[property]
  }
  return picked
}

UEnv.prototype.omit = function (key, properties = []) {
  const value = this.get(key)
  const picked = {}
  if (!value || !this.__isPlainObject(value)) return {}
  
  for (const property in value) {
    if (properties.includes(property)) continue
    picked[property] = value[property]
  }
  return picked
}

UEnv.prototype.equals = function (k, v) {
  return this.__references.has(k) && this.__references.get(k) === v
}

UEnv.prototype.toJSON = function () {
  return this.__props
}

UEnv.prototype.has = function (k) {
  return this.__references.has(k)
}

UEnv.prototype.plugin = function (name, Cls) {
  this.__plugins[name] = Cls

  // setup shorthand methods
  this[name] = (...args) => {
    return this.use(name, ...args)
  }

  this[`${name}Child`] = (position, ...args) => {
    return this.child(position, name, ...args)
  }
}

UEnv.prototype.use = function (name, ...args) {
  assert.ok(this.__plugins.hasOwnProperty(name), 'unregistered plugin ' + name)

  const use = new this.__plugins[name]({
    toJSON: this.toJSON.bind(this),
    assign: this.assign.bind(this),
    set: this.set.bind(this),
    get: this.get.bind(this),
    has: this.has.bind(this),
    any: this.any.bind(this),
    pick: this.pick.bind(this),
    omit: this.omit.bind(this)
  }, ...args)
  return use
}

UEnv.prototype.child = function (position, name, ...args) {
  assert.ok(this.__plugins.hasOwnProperty(name), 'unregistered plugin ' + name)

  const child = new this.__plugins[name]({
    toJSON: () => {
      return this.get(position)
    },
    assign: (obj) => {
      for (let k in obj) {
        this.set(`${position}${this.__options.separator}${k}`, obj[k])
      }
    },
    set: (k, v) => {
      this.set(`${position}${this.__options.separator}${k}`, v)
    },
    get: (k) => {
      return this.get(`${position}${this.__options.separator}${k}`)
    },
    has: (k) => {
      return this.has(`${position}${this.__options.separator}${k}`)
    },
    any: (keys = []) => {
      return this.any(keys.map(k => `${position}${this.__options.separator}${k}`))
    },
    pick: (k, properties = []) => {
      return this.pick(`${position}${this.__options.separator}${k}`, properties)
    },
    omit: (k, properties = []) => {
      return this.omit(`${position}${this.__options.separator}${k}`, properties)
    }
  }, ...args)
  return child
}

UEnv.prototype.instance = function () {
  const uenv = new UEnv()
  for (const name in this.__plugins) {
    uenv.plugin(name, this.__plugins[name])
  }
  return uenv
}

UEnv.prototype.__setReferences = function (k, root, { references = true } = {}) {
  this.__references.set(k, root)
  if (references && this.__isPlainObject(root)) {
    for (const nk in root) {
      this.__setReferences(`${k}${this.__options.separator}${nk}`, root[nk], { references })
    }
  }
}

UEnv.prototype.__removeReferences = function (base) {
  if (this.__references.has(base)) {
    this.__references.delete(base)
  }
  for (const key of this.__references.keys()) {
    if (!key.startsWith(`${base}${this.__options.separator}`)) continue
    this.__references.delete(key)
  }
}

UEnv.prototype.__isPlainObject = function (obj) {
  if (typeof obj !== 'object' || obj === null) return false
  const proto = Object.getPrototypeOf(obj)
  return proto === Object.prototype || proto === null
}
const uenv = new UEnv()

// load some default plugins
uenv.plugin('literal', PluginLiteral)
uenv.plugin('env', PluginEnv)
uenv.plugin('json', PluginJson)

module.exports = uenv
