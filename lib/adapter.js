function Adapter(adapter, config) {
    this.adapter = adapter;
    this.adapter.connect(config);
}

Adapter.prototype.save = function(obj) {
    this.adapter.save(obj);
};

module.exports = Adapter;
