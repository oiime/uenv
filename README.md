## about

`uenv` is a zero dependency configuration manager for nodejs, its design goals is to be very fast, allow finely grained access to properties via references, have an easy and straight-forward plugin system, allow different routines within the system to set up different parts of the configuration without having to be aware of the entire tree structure

## installation
```bash
npm install --save uenv
```

## by example

```javascript
const uenv = require('uenv')

// import enviorment variables into configuration
uenv.use('env')

// assign an object to the root of the configuraiton tree
uenv.assign({
  foo: 'bar',
  nested: {
    value: {
      a: 1
    }
  }
})

uenv.set('nested.value.b', 2)

// creates a new child with the literal plugin
const child = uenv.literalLeaf('child')

// sets a value referenced as 'child.subfoo'
child.set('subfoo', 'subvar')

// assign multiple values to child
child.assign({
    c: 9,
    d: 10
})

// assign json contents to configuraiton root
uenv.json('/path/to/file.json')

// assign json contents to { jsonData: {} }
uenv.jsonLeaf('jsonData','/path/to/file.json' )

// seal a property against changes
uenv.seal('foo')
uenv.set('foo', 'notbar')

uenv.get('foo')               // bar
uenv.equals('foo', 'bar')     // true
uenv.get('nested')            // { value: { a: 1, b: 2 } }
uenv.get('nested.value')      // { a: 1, b: 2 }
uenv.get('nested.value.a')    // 1
uenv.get('nested.value.b')    // 2

uenv.toJSON()
// {
//     foo: 'bar',
//     nested: {
//       value: {
//         { a: 1, b: 2 }
//       }
//     },
//     child: {
//       subfoo: 'subvar',
//       c: 9,
//       d: 10
//     }
// }

```
## plugins

#### built-in
* literal   - a simple get/set/assign storage for objects
* env       - loads the environment variables into the configuration as-is
* json      - allows reading configuration from a json file, can also be used to store the file

#### external repositories
* [`uenv-s3-plugin`][https://github.com/oiime/uenv-s3-plugin] - stores and retrieves configuration from AWS S3, allows encryption before storage

## API

#### uenv.assign(obj)

Assigns an entire object to the configuration

* obj = plain javascript object to assign

#### uenv.set(key, value, options = {})

Assigns an entire object to the configuration

* key - key to set, using a separator (eg: 'foo.bar') would set references for the entire hierarchy
* value - just... the value
* options - optional parameters
  * references (bool) - if set to false, there would be no references set for any properties of the value (if the value is an object), this can be useful if you dont want to waste memory and need to store large objects

#### uenv.get(key)

Returns a property value


### uenv.has (key)

Checks if key exists, returns a boolean

### uenv.toJSON ()

Returns a plain javascript object of all properties

### uenv.plugin (name, Plugin)

registers a new plugin, Plugin would be constructed whenever `use` or `leaf` are called with its name

### uenv.use (name, ...args)

Initiates a plugin that'll have access to the properties, any arguments after the plugin name would be passed as arguments to the plugin itself

### uenv.leaf (key, name, ...args)

Initiates a plugin that'll have access to the properties at a specific position, any arguments after the plugin name would be passed as arguments to the plugin itself
Key can be dot notated to get a leaf at a deeper part of the tree, any preceding keys would be created with references

### uenv.equals (key, value)

Checks if a key is equal to a value, returns a boolean

#### uenv.seal (key)

Seals a key, any subsequent attempts to write to this key would not change the stored value

#### uenv.setOptions (options = {})

Allows changes internal options within uenv

* options
  * separator - change the default separator (.) to something else, this needs to be set before any property is set as that'll screw up the references
  ```javascript
  uenv.setOptions({ separator: ':'})
  uenv.set('foo:bar', 1)
  uenv.get('foo:bar')
  ```


#### uenv.instance ()


## jsonPlugin methods

Gets a standalone instance of uenv that does not store its properties at the module itself

#### uenv.json (filename, { required = true })
* filename - required argument if required is set to true (default), filename to load json from
* options
  * required - if set to false the plugin would ignore any errors trying to load the json file

#### uenv.jsonLeaf (key, filename, { required = true })
* key to place object in
* filename - required argument if required is set to true (default), filename to load json from
* options
  * required - if set to false the plugin would ignore any errors trying to load the json file


#### [jsonleaf].save (filename)

saves current configuration to json file, if filename is not provided it'll save to the same filename set up during construction

License: MIT
