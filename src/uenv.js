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

  for (const leaf of leafs) {
    let obj
    if (!props.hasOwnProperty(leaf)) {
      obj = {}
      // we need to backtrace references here
      this.set(leafs.join(this.__options.separator), obj, { references: true })
    } else {
      obj = props[leaf]
    }
    props[leaf] = obj
    props = props[leaf]
    leafs.shift()
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

  this[`${name}Leaf`] = (position, ...args) => {
    return this.leaf(position, name, ...args)
  }
}

UEnv.prototype.use = function (name, ...args) {
  assert.ok(this.__plugins.hasOwnProperty(name), 'unregistered plugin ' + name)

  const use = new this.__plugins[name]({
    toJSON: this.toJSON.bind(this),
    assign: this.assign.bind(this),
    set: this.set.bind(this),
    get: this.get.bind(this),
    has: this.has.bind(this)
  }, ...args)
  return use
}

UEnv.prototype.leaf = function (position, name, ...args) {
  assert.ok(this.__plugins.hasOwnProperty(name), 'unregistered plugin ' + name)

  const leaf = new this.__plugins[name]({
    toJSON: () => {
      return this.get(position)
    },
    assign: (obj) => {
      this.set(position, obj)
    },
    set: (k, v) => {
      this.set(`${position}${this.__options.separator}${k}`, v)
    },
    get: (k) => {
      return this.get(`${position}${this.__options.separator}${k}`)
    },
    has: (k) => {
      return this.has(`${position}${this.__options.separator}${k}`)
    }
  }, ...args)
  return leaf
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
