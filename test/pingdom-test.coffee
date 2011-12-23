assert = require 'assert'
vows   = require 'vows'
pc = require '../lib/pingdom'

vows
  .describe('Pingdom constructor')
  .addBatch
    'when version is not passed in':
        topic: -> pc.createClient('apiKey', 'username', 'password'),

        "the version defaults to '2.0'": (topic) ->
          assert.equal topic.version, '2.0'

        "the apiKey is still set": (topic) ->
          assert.equal topic.apiKey, 'apiKey'

        "the username is still set": (topic) ->
          assert.equal topic.username, 'username'

        "the password is still set": (topic) ->
          assert.equal topic.password, 'password'


  .addBatch
    'when version is passed in':

      'and the version is null':
        topic: -> pc.createClient('apiKey', 'username', 'password', null),

        "the version is set to '2.0'": (topic) ->
          assert.equal topic.version, '2.0'

        "the apiKey is still set": (topic) ->
          assert.equal topic.apiKey, 'apiKey'

        "the username is still set": (topic) ->
          assert.equal topic.username, 'username'

        "the password is still set": (topic) ->
          assert.equal topic.password, 'password'


      'and the version is not null':
        topic: -> pc.createClient('apiKey', 'username', 'password', 'other-version'),

        "the version is set to what's passed in": (topic) ->
          assert.equal topic.version, 'other-version'

        "the apiKey is still set": (topic) ->
          assert.equal topic.apiKey, 'apiKey'

        "the username is still set": (topic) ->
          assert.equal topic.username, 'username'

        "the password is still set": (topic) ->
          assert.equal topic.password, 'password'


  .export module
