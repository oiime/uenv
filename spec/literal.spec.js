/* eslint-env node, mocha */

const { assert } = require('chai')
const uenv = require('../src/uenv')

describe('#uenv.child()', function () {
  const instance = uenv.instance()
  const child = instance.literalChild('child', { foo: 'notbar' })

  child.set('foo', 'bar')

  it('should get root properties from root', function () {
    assert.equal(instance.get('child.foo'), 'bar')
  })

  it('should get root properties from child', function () {
    assert.equal(child.get('foo'), 'bar')
  })
})

describe('#uenv.literal()', function () {
  const instance = uenv.instance()
  const child = instance.literal()

  child.set('foo', 'bar')

  it('should get root properties from root', function () {
    assert.equal(instance.get('foo'), 'bar')
  })

  it('should get root properties from child', function () {
    assert.equal(child.get('foo'), 'bar')
  })
})
