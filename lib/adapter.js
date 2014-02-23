var augment = require('augment');

var Adapter = augment(Object, function() {
    this.constructor = function(adapter, config) {
        this.adapter = adapter;
        this.adapter.connect(config);
    };

    this.save = function(obj) {
        this.adapter.save(obj);
    };
});

module.exports = Adapter;
