const Promise = require('bluebird')
const request = require('request')

const clients = require('./lib/clients')

    //uri: 'http://localhost:5000/v2/_catalog/',
    //uri: 'http://unix:/var/run/docker.sock:/images/json',

var engine = new clients.DockerEngine({socket: '/var/run/docker.sock'})
var registry = new clients.DockerRegistry({host: 'localhost', port: 5000})

