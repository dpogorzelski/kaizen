function Adapter(adapter, config) {
    this.adapter = adapter;
    this.adapter.connect(config);
}

Adapter.prototype.update = function(obj) {
    this.adapter.update(obj);
};

Adapter.prototype.save = function(obj) {
    this.adapter.save(obj);
};

module.exports = Adapter;
