module.exports = function (app, config) {
    config = config || {};

    var gpio = require('rpi-gpio');
    if (gpio.setConfig) {
        gpio.setConfig(config.gpio);
    }

    var w1 = require('gpio-1wire')(config.w1);

    var nsApi = config.apiRoot || '/api';
    var nsGpio = '/gpio';
    var ns1Wire = '/1wire';

    var handleResponse = function (req, res, json) {
        if (req.param('html')) {
            var html = '<html><body>';
            if (json.header) {
                html += '<h1>' + json.header + '</h1>';
            }

            var outputProperty = function (key, value) {
                var snippet = '<div>';
                snippet += '<span>' + key + '</span>';
                snippet += '<span>=</span>';
                snippet += '<span>' + value + '</span>';
                snippet += '</div>';
                return snippet;
            };

            var outputObject = function (key, object) {

            };

            if (json.data) {
                for (var d in json.data) {
                    var o = json.data[d];
                    if (typeof o != 'object') {
                        html += outputProperty(d, o);
                    } else {
                        html += outputObject(d, o);
                    }
                }
            }
            if (json.links) {
                for (var l in json.links) {
                    html += '<a href="' + json.links[l] + '?html=true">' + l + '</a><br>';
                }
            }

            html += '</body></html>';

            res.send(html);
        } else {
            res.json(json);
        }
    };

    app.namespace(nsApi, function () {
        app.get('/', function (req, res) {
            handleResponse(req, res, {
                'links': {
                    'gpio': nsApi + nsGpio,
                    '1wire': nsApi + ns1Wire
                }
            });
        });

        app.namespace(nsGpio, function () {

            app.get('/:id', function (req, res) {
                gpio.read(req.param('id'), function (err, value) {
                    if (!err) {
                        handleResponse(req, res, {
                            //TODO change the req.param(id) by an appropriate parameter -> etend gpio api
                            'header': 'Read GPIO Pin ' + req.param('id'),
                            'data': {
                                'value': value
                            }
                        });
                    } else {
                        res.status(400).send(err);
                    }
                });
            });

            app.post('/:id', function (req, res) {
                gpio.write(req.param('id'), req.param('value'), function (err, value) {
                    if (!err) {
                        handleResponse(req, res, {
                            //TODO change the req.param(id) by an appropriate parameter -> etend gpio api
                            'header': 'Write GPIO Pin ' + req.param('id'),
                            'data': {
                                'value': value
                            }
                        });
                    } else {
                        res.status(400).send(err);
                    }
                });
            });
        });

        app.namespace(ns1Wire, function () {

            app.get('/', function (req, res) {
                w1.list(function (err, devices) {
                    if (!err) {
                        handleResponse(req, res, {
                            'header': '1Wire Devices',
                            'data': {
                                'devices': devices
                            }
                        });
                    } else {
                        res.status(400).send(err);
                    }
                });
            });

            app.get('/:id', function (req, res) {
                w1.read(req.param('id'), req.param('sensor'), function (err, record) {
                    if (!err) {
                        handleResponse(req, res, {
                            'data': record
                        });
                    } else {
                        res.status(400).send(err);
                    }
                });
            });
        });

    });
};