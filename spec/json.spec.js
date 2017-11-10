/* eslint-env node, mocha */
const fs = require('fs')
const path = require('path')
const { assert } = require('chai')
const uenv = require('../src/uenv')

describe('#uenv.json()', function () {
  const filename = path.join(__dirname, 'assets', 'test.json')
  const origin = JSON.parse(fs.readFileSync(filename, 'utf8').toString())
  const instance = uenv.instance()
  instance.json(filename)

  it('should get root properties from root', function () {
    assert.deepEqual(instance.toJSON(), origin)
  })
})

describe('#uenv.jsonChild()', function () {
  const filename = path.join(__dirname, 'assets', 'test.json')
  const origin = JSON.parse(fs.readFileSync(filename, 'utf8').toString())
  const instance = uenv.instance()
  const child = instance.jsonChild('child', filename)

  it('should get root properties from root', function () {
    assert.deepEqual(instance.get('child'), origin)
  })

  it('should get root properties from child', function () {
    assert.deepEqual(child.toJSON(), origin)
  })
})
