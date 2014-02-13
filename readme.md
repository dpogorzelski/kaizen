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
    
    app.use(kaizen());
    
##### Choose a different color scheme

    var kaizen = require('kaizen');

    app.use(kaizen({
        style: 'railscasts'
    }));
##### Use your color scheme

    var kaizen = require('kaizen');

    app.use(kaizen({
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

    app.use(kaizen({
        uri: 'mongodb://user:password@localhost/yourdb',
        collection: 'foobar',
        stdout: false,
        style: 'railscasts'
    }, k_mongodb));
    
##### Create your own Adapter

    // Write a NodeJS module which exports two functions: connect() and save() 
    
    exports.connect = function(config) {
        // handle the connection to DB
        // config arg is the global config object passed during kaizen init stage
        // example: {
        //        uri: 'mongodb://user:password@localhost/yourdb',
        //        collection: 'foobar',
        //        stdout: false,
        //        style: 'railscasts'
        //    }
        
        return;
    };
    
    exports.save = function(obj) {
        // handle log parsing/saving to DB
        // obj arg 
        // example:
        // {
        //  "headers": {
        //      "user-agent": "curl/7.22.0 (x86_64-pc-linux-gnu)",
        //      "host": "127.0.0.1:3000",
        //      "accept": "*/*"
        //      },
        //  "body": {},
        //  "method": "GET",
        //  "url": "/",
        //  "protocol": "http",
        //  "version": "1.1"
        // }

        return;
    };

    // then just require and pass it to kaizen with your config options:
    var kaizen = require('kaizen');
    var k_mongodb = require('kaizen-mongodb');

    app.use(kaizen({
        uri: 'mongodb://user:password@localhost/yourdb',
        collection: 'foobar',
        stdout: false,
        style: 'railscasts'
    }, k_mongodb));

  [1]: http://expressjs.com
  [2]: http://chriskempson.github.io/base16/