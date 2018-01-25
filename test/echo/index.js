const Client = require('../../client');
const uuid = require('uuid/v4');

const port = 8212;

describe("#tcp-framework", function() {
    it('should return [echo]', function (done) {
        const client = new Client({port});
        client.on('data', ({uuid, data}) => {
            if (data.toString('utf8') !== 'echo') {
                done(new Error('response mismatch'));
                return;
            }
            done();
        });
        client.send({uuid:uuid().replace(/-/g, ''), data:Buffer.from('echo')});
    });
});