/* eslint-env node, mocha */

const { assert } = require('chai')
const uenv = require('../src/uenv')

describe('#uenv.setOptions()', function () {
  const instance = uenv.instance()
  instance.setOptions({ separator: ':' })
  const sourceObject = {
    foo: 'bar',
    nested: {
      property: {
        foo: 'bar'
      }
    }
  }

  instance.assign(sourceObject)
  instance.set('new:separator:value', 1)

  it('should get by new separator', function () {
    assert.equal(instance.get('nested:property:foo'), 'bar')
  })

  it('should set by new separator', function () {
    assert.deepEqual(instance.get('new:separator'), { value: 1 })
  })
})

describe('#uenv.assign()', function () {
  const instance = uenv.instance()
  const sourceObject = {
    foo: 'bar',
    nested: {
      property: {
        foo: 'bar'
      }
    }
  }

  instance.assign(sourceObject)

  it('should be equal to origin', function () {
    assert.deepEqual(instance.toJSON(), sourceObject)
  })

  it('should get root properties', function () {
    assert.equal(instance.get('foo'), 'bar')
  })

  it('should get nested properties', function () {
    assert.equal(instance.get('nested.property.foo'), 'bar')
  })
})

describe('#uenv.set()', function () {
  const instance = uenv.instance()
  instance.set('foo', 'bar')
  instance.set('nested.property.foo', 'bar')
  instance.set('overwrite', { a: 1, b: 2 })
  instance.set('overwrite', { a: 2, c: 2 })
  instance.set('overwrite.d', 5)

  it('should get root properties', function () {
    assert.equal(instance.get('foo'), 'bar')
  })

  it('should get nested properties', function () {
    assert.equal(instance.get('nested.property.foo'), 'bar')
  })

  it('should get nested properties from parent reference', function () {
    assert.deepEqual(instance.get('nested.property'), { foo: 'bar' })
  })

  it('should reset references on overwrite', function () {
    assert.deepEqual(instance.get('overwrite'), { a: 2, c: 2, d: 5 })
    assert.equal(instance.get('overwrite.a'), 2)
    assert.equal(instance.get('overwrite.c'), 2)
    assert.equal(instance.get('overwrite.d'), 5)
    assert.isUndefined(instance.get('overwrite.b'))
  })
})

describe('#uenv.seal()', function () {
  const instance = uenv.instance()
  instance.set('foo', 'bar')
  instance.seal('foo')
  instance.set('foo', 'notbar')

  it('should seal the property', function () {
    assert.equal(instance.get('foo'), 'bar')
  })
})

describe('#uenv.equals()', function () {
  const instance = uenv.instance()
  instance.set('foo', 'bar')

  it('should check equality', function () {
    assert.isTrue(instance.equals('foo', 'bar'))
    assert.isFalse(instance.equals('foo', 'notbar'))
  })
})

describe('#uenv.__isPlainObject()', function () {
  const instance = uenv.instance()

  it('should only allow plain objects', function () {
    assert.isTrue(instance.__isPlainObject({}))
    assert.isFalse(instance.__isPlainObject(null))
    assert.isFalse(instance.__isPlainObject(undefined))
    assert.isFalse(instance.__isPlainObject(false))
    assert.isFalse(instance.__isPlainObject(new Date()))
    assert.isFalse(instance.__isPlainObject(() => {}))
  })
})
