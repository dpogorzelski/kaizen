# Kaizen

> [ExpressJS][1] Log Middleware

### Features

 - stores log information in a persistence layer of your choice
 - pretty prints colored and structutred output
 - implements [base16 color schemes][2] and allows to create custom ones
 - plug-in system to create your own DB adapters

### Install

    npm install kaizen
    
### Usage
##### Basic

    var kaizen = require('kaizen');
    
    app.use(kaizen.log());
    
    //your routes here
    
    app.use(kaizen.error());
    
##### Choose a different color scheme

    var config = {
        style: 'railscasts'
    };

    app.use(kaizen.log(config));
    
    //your routes here
    
    app.use(kaizen.error(config));
    
##### Use your color scheme

    app.use(kaizen.log({
        style: {
            '00': '#001100',
            '01': '#003300',
            '02': '#005500',
            '03': '#007700',
            '04': '#009900',
            '05': '#00bb00',
            '06': '#00dd00',
            '07': '#00ff00',
            '08': '#007700',
            '09': '#009900',
            '0A': '#007700',
            '0B': '#00bb00',
            '0C': '#005500',
            '0D': '#009900',
            '0E': '#00bb00',
            '0F': '#005500'
        }
    }));
##### Write to MongoDB
    
    var kaizen = require('kaizen');
    var k_mongodb = require('kaizen-mongodb');
    
    var config = {
        uri: 'mongodb://user:password@localhost/yourdb',
        collection: 'foobar',
        stdout: false,
        style: 'railscasts'
    }

    app.use(kaizen.log(config, k_mongodb));
    
    //your routes here
    
    app.use(kaizen.error(config, k_mongodb));
    
##### Create your own Adapter

    // Write a module which exports 3 functions: connect(), update() and save() 
    
    exports.connect = function(config) {
        // handle the connection to DB
        // config arg is the global config object passed during kaizen init stage
        // example: {
        //        uri: 'mongodb://user:password@localhost/yourdb',
        //        collection: 'foobar',
        //        stdout: false,
        //        style: 'railscasts'
        //    }
    };
    
    exports.save = function(obj) {
        // handles req parsing/saving to DB
        // example:
        // {
        //   "req": {
        //     "headers": {
        //       "user-agent": "curl/7.22.0 (x86_64-pc-linux-gnu)",
        //       "host": "127.0.0.1:3000",
        //       "accept": "*/*"
        //     },
        //     "body": {},
        //     "method": "GET",
        //     "url": "/",
        //     "protocol": "http",
        //     "version": "1.1"
        //   }
        // }

    };
    
    exports.update = function(obj) {
        // this function updates the original obj by adding res
        // this way req and res are stored as one entity and 
    };

    // require and pass it to kaizen with your config options:
    var kaizen = require('kaizen');
    var yourmod = require('yourmod');

    app.use(kaizen.log({your:conf}, yourmod));

  [1]: http://expressjs.com
  [2]: http://chriskempson.github.io/base16/