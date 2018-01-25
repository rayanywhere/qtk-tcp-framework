const Client = require('../../client');
const uuid = require('uuid/v4');

const port = 8212;

describe("#tcp-framework", function() {
    this.timeout(10000);   
    it('should return without error after 3 sec', function (done) {
        const timeStart = new Date();      
        const client = new Client({port});
        client.on('data', ({uuid, data}) => {
            if (data.toString('utf8') !== 'delayed_echo') {
                done(new Error('response mismatch'));
                return;
            }

            const timeEnd = new Date();
            if (timeEnd - timeStart < 3000) {
                done(new Error('should not be responded within 3 sec'));
                return;
            }
            done();
        });
        client.send({uuid:uuid().replace(/-/g, ''), data:Buffer.from('delayed_echo')});        
    });
});