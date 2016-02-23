var API_PREFIX = '/api/test/';

module.exports = {
    createTestWorker: function(app, __dirname) {
        var reqN = 0;

        app.get('/test', function(req, res) {
            res.sendFile(__dirname + '/public/test.html');
        });
        app.get(API_PREFIX + 'smallData', function(req, res) {
            reqN++;
            var resA = [];
            for (var i = 0; i < 1000; i++) {
                resA.push(i);
            }
            var data = {
                time: 1,
                req: reqN,
                reqS: resA
            };

            res.send(data);
        });
        return this;
    }
};