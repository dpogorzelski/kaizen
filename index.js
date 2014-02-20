var ansi = require('ansi'),
    cursor = ansi(process.stdout),
    _ = require('underscore'),
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

exports.error = function(user_config, adapter) {
    var config = {
        style: 'default',
        stdout: true
    },
        base;

    _.extend(config, user_config);

    if (!_.isUndefined(adapter))
        var db = new Adapter(adapter, config);

    _.isObject(config.style) ? base = config.style : base = styles[config.style]
    return function(err, req, res, next) {
        var error = {
            message: err.message,
            stack: err.stack
        };

        if (config.stdout)
            printErr(error, base);

        if (!_.isUndefined(adapter))
            db.save(error);


        next(err);
    };
};



exports.log = function(user_config, adapter) {
    var config = {
        style: 'default',
        stdout: true
    },
        base;

    _.extend(config, user_config);

    if (!_.isUndefined(adapter))
        var db = new Adapter(adapter, config);

    _.isObject(config.style) ? base = config.style : base = styles[config.style]
    return function(req, res, next) {
        var transaction = {
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

        if (!_.isUndefined(adapter))
            db.save(transaction);

        if (config.stdout)
            printReq(transaction.req, base);

        res.write = function(chunk) {
            chunks += chunk;
            write.apply(res, arguments);
        };

        res.end = function(chunk) {
            if (chunk)
                chunks += chunk;

            var body = chunks.toString('utf8');
            transaction.res = {
                statusCode: res.statusCode,
                headers: res._headers,
                body: body,
                protocol: req.protocol,
                version: req.httpVersion
            };

            if (!_.isUndefined(adapter))
                db.update(transaction);

            if (config.stdout)
                printRes(transaction.res, base);

            end.apply(res, arguments);
        };
        next();
    };
};
