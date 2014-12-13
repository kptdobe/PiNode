

module.exports = function(app, config) {
    var gpio = require('rpi-gpio')(config.gpio);
    var w1 = require('gpio-1wire')(config.w1);

    app.namespace('/api', function() {

        app.namespace('/gpio', function() {

            app.get('/:id', function(req, res) {
                gpio.setup(req.param('id'), gpio.DIR_IN, function() {
                    gpio.read(req.param('id'), function(err, value) {
                        if (!err) {
                            res.json({
                                'value': value
                            });
                        } else {
                            res.status(400).send(err);
                        }
                    });
                });
                });

            app.post('/:id', function(req, res) {
                gpio.setup(req.param('id'), gpio.DIR_OUT, function() {
                    gpio.write(req.param('id'), req.param('value'), function (err, value) {
                        if (!err) {
                            res.json({
                                'value': value
                            });
                        } else {
                            res.status(400).send(err);
                        }
                    });
                });
            });
        });

        app.namespace('/1wire', function() {

            app.get('/', function(req, res) {
                w1.list(function (err, devices) {
                    if (!err) {
                        res.json({
                            'devices': devices
                        });
                    } else {
                        res.status(400).send(err);
                    }
                });
            });

            app.get('/:id', function(req, res) {
                w1.read(req.param('id'), req.param('sensor'), function (err, record) {
                    if ( !err ) {
                        res.json(record);
                    } else {
                        res.status(400).send(err);
                    }
                });
            });
        });

    });
};