/* eslint-env mocha */

const assert = require('assert')
const ParameterTypeRegistry = require('../src/parameter_type_registry')
const ParameterType = require('../src/parameter_type')

class Color {}
class Name {}
class Person {}
class Place {}

const CAPITALISED_WORD = /[A-Z]+\w+/

describe('ParameterTypeRegistry', () => {
  let registry
  beforeEach(() => {
    registry = new ParameterTypeRegistry()
  })

  it('looks up preferential parameter type by constructor', () => {
    registry.defineParameterType(
      new ParameterType(
        'color',
        /red|blue|green/,
        Color,
        s => new Color(s),
        true,
        true
      )
    )
    const parameterType = registry.lookupByType(Color)
    assert.equal(parameterType.name, 'color')
  })

  it('does not allow more than one preferential parameter type for each regexp', () => {
    registry.defineParameterType(
      new ParameterType(
        'name',
        CAPITALISED_WORD,
        Name,
        s => new Name(s),
        true,
        true
      )
    )
    registry.defineParameterType(
      new ParameterType(
        'person',
        CAPITALISED_WORD,
        Person,
        s => new Person(s),
        false,
        true
      )
    )
    try {
      registry.defineParameterType(
        new ParameterType(
          'place',
          CAPITALISED_WORD,
          Place,
          s => new Place(s),
          true,
          true
        )
      )
      throw new Error('Should have failed')
    } catch (err) {
      assert.equal(
        err.message,
        `There can only be one preferential parameter type per regexp. The regexp ${CAPITALISED_WORD} is used for two preferential parameter types, {name} and {place}`
      )
    }
  })

  it('looks up preferential parameter type by regexp', () => {
    const name = new ParameterType('name', /[A-Z]+\w+/, null, null, false, true)
    const person = new ParameterType(
      'person',
      /[A-Z]+\w+/,
      null,
      null,
      true,
      true
    )
    const place = new ParameterType(
      'place',
      /[A-Z]+\w+/,
      null,
      null,
      false,
      true
    )

    registry.defineParameterType(name)
    registry.defineParameterType(person)
    registry.defineParameterType(place)

    assert.equal(
      registry.lookupByRegexp(
        '[A-Z]+\\w+',
        /([A-Z]+\w+) and ([A-Z]+\w+)/,
        'Lisa and Bob'
      ),
      person
    )
  })
})
