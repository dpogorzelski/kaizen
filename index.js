var ansi = require('ansi'),
    cursor = ansi(process.stdout),
    _ = require('underscore'),
    cuid = require('cuid'),
    Adapter = require('./lib/adapter'),
    styles = require('./lib/styles');

function toTitleCase(str) {
    return str.replace(/(?:^|-)\w/g, function(match) {
        return match.toUpperCase();
    });
}

function printReq(_req, id, base) {
    cursor
        .hex(base['07'])
        .write('ID: ' + id + '\n')
        .hex(base['08'])
        .write(_req.method + ' ')
        .hex(base['0B'])
        .write(_req.url + ' ')
        .hex(base['08'])
        .write(_req.protocol.toUpperCase() + '/' + _req.version + '\n');

    _.each(_req.headers, function(e, i) {
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
        .write(JSON.stringify(_req.body, null, 4));

    cursor.write('\n\n');
    cursor.reset();
}

function printRes(_res, id, base) {
    cursor
        .hex(base['07'])
        .write('ID: ' + id + '\n')
        .hex(base['08'])
        .write(_res.protocol.toUpperCase() + '/' + _res.version + ' ')
        .hex(base['0B'])
        .write(_res.statusCode + '\n');

    _.each(_res.headers, function(e, i) {
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
        .write(JSON.stringify(_res.body, null, 4));

    cursor.write('\n\n');
    cursor.reset();
}

function kaizen(user_config, adapter) {
    var config = {
        style: 'default',
        stdout: true
    };
    var base;

    _.extend(config, user_config);

    if (!_.isUndefined(adapter))
        var db = new Adapter(adapter, config);


    _.isObject(config.style) ? base = config.style : base = styles[config.style]

    return function(req, res, next) {

        var id = cuid.slug();
        var end = res.end;
        var write = res.write;
        var chunks = [];

        var _req = {
            headers: req.headers,
            params: req.params,
            body: req.body,
            method: req.method,
            url: req.originalUrl,
            protocol: req.protocol,
            version: req.httpVersion

        };
        if (!_.isUndefined(adapter))
            db.save(_req);

        if (config.stdout)
            printReq(_req, id, base);

        res.write = function(chunk) {
            chunks.push(chunk);
            write.apply(res, arguments);
        };

        res.end = function(chunk) {
            if (chunk) {
                chunks.push(chunk);
            }
            var body = Buffer.concat(chunks).toString('utf8');
            var _res = {
                statusCode: res.statusCode,
                headers: res._headers,
                body: body,
                protocol: req.protocol,
                version: req.httpVersion
            };
            if (!_.isUndefined(adapter))
                db.save(_res);

            if (config.stdout)
                printRes(_res, id, base);

            end.apply(res, arguments);
        };
        next();
    };
}

module.exports = kaizen;
