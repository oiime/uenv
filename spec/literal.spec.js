/* eslint-env node, mocha */

const { assert } = require('chai')
const uenv = require('../src/uenv')

describe('#uenv.literalLeaf()', function () {
  const instance = uenv.instance()
  const leaf = instance.literalLeaf('child', { foo: 'notbar' })

  leaf.set('foo', 'bar')

  it('should get root properties from root', function () {
    assert.equal(instance.get('child.foo'), 'bar')
  })

  it('should get root properties from leaf', function () {
    assert.equal(leaf.get('foo'), 'bar')
  })
})

describe('#uenv.literal()', function () {
  const instance = uenv.instance()
  const leaf = instance.literal()

  leaf.set('foo', 'bar')

  it('should get root properties from root', function () {
    assert.equal(instance.get('foo'), 'bar')
  })

  it('should get root properties from leaf', function () {
    assert.equal(leaf.get('foo'), 'bar')
  })
})
