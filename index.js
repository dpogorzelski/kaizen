var ansi = require('ansi'),
    cursor = ansi(process.stdout),
    _ = require('underscore'),
    augment = require('augment'),
    Adapter = require('./lib/adapter'),
    styles = require('./lib/styles');

function toTitleCase(str) {
    return str.replace(/(?:^|-)\w/g, function(match) {
        return match.toUpperCase();
    });
}

function printReq(req, base) {
    cursor
        .hex(base['08'])
        .write(req.method + ' ')
        .hex(base['0B'])
        .write(req.url + ' ')
        .hex(base['08'])
        .write(req.protocol.toUpperCase() + '/' + req.version + '\n');

    _.each(req.headers, function(e, i) {
        cursor
            .hex(base['0D'])
            .write(toTitleCase(i))
            .hex(base['07'])
            .write(': ')
            .hex(base['0B'])
            .write(e + '\n');
    });

    cursor
        .hex(base['0A'])
        .write(JSON.stringify(req.body, null, 4));

    cursor.write('\n\n');
    cursor.reset();
}

function printRes(res, base) {
    cursor
        .hex(base['08'])
        .write(res.protocol.toUpperCase() + '/' + res.version + ' ')
        .hex(base['0B'])
        .write(res.statusCode + '\n');

    _.each(res.headers, function(e, i) {
        cursor
            .hex(base['0D'])
            .write(toTitleCase(i))
            .hex(base['07'])
            .write(': ')
            .hex(base['0B'])
            .write(e + '\n');
    });

    cursor
        .hex(base['0A'])
        .write(JSON.stringify(res.body, null, 4));

    cursor.write('\n\n');
    cursor.reset();
}

function printErr(err, base) {
    cursor
        .hex(base['08'])
        .write('Message: ' + err.message + '\nStack: ' + err.stack + '\n');

    cursor.write('\n');
    cursor.reset();

}

var Kaizen = augment(Object, function() {
    this.constructor = function(config, adapter) {
        this.config = {
            style: 'default',
            stdout: true
        };
        this.adapter = adapter;
        this.base;

        _.extend(this.config, config);

        if (!_.isUndefined(adapter))
            this.db = new Adapter(adapter, this.config);

        _.isObject(this.config.style) ? this.base = this.config.style : this.base = styles[this.config.style]
    };

    this.error = function() {
        var self = this;
        return function(err, req, res, next) {
            self.transaction.error = {
                message: err.message,
                stack: err.stack
            };

            if (!_.isUndefined(self.adapter))
                self.db.save(self.transaction);

            if (self.config.stdout)
                printErr(self.transaction.error, self.base);

            next(err);
        };
    };

    this.log = function() {
        var self = this;
        return function(req, res, next) {
            self.transaction = {
                req: {
                    headers: req.headers,
                    params: req.params,
                    body: req.body,
                    method: req.method,
                    url: req.originalUrl,
                    protocol: req.protocol,
                    version: req.httpVersion
                }
            };
            var end = res.end;
            var write = res.write;
            var chunks = '';

            if (!_.isUndefined(self.adapter))
                self.db.save(self.transaction);

            if (self.config.stdout)
                printReq(self.transaction.req, self.base);

            res.write = function(chunk) {
                chunks += chunk;
                write.apply(res, arguments);
            };

            res.end = function(chunk) {
                if (chunk)
                    chunks += chunk;

                var body = chunks.toString('utf8');
                self.transaction.res = {
                    statusCode: res.statusCode,
                    headers: res._headers,
                    body: body,
                    protocol: req.protocol,
                    version: req.httpVersion
                };

                if (!_.isUndefined(self.adapter))
                    self.db.save(self.transaction);

                if (self.config.stdout)
                    printRes(self.transaction.res, self.base);

                end.apply(res, arguments);
            };
            next();
        };
    };
});

module.exports = Kaizen;
