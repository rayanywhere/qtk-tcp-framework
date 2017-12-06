const InstantClient = require('../../client/instant');
const PersistentClient = require('../../client/persistent');
const uuid = require('uuid/v4');

const port = 8212;

describe("#tcp-framework-instant", function() {
    it('[using instant mode] should return [echo]', async function () {
        let client = new InstantClient({port});
        let responsePayload = await client.request(Buffer.from('echo'));
        assert(responsePayload.toString('utf8') === 'echo');
    });
    it('[using persistent mode] should return [echo]', function (done) {
        const client = new PersistentClient({port});
        client.onData = ({uuid, buffer}) => {
            if (buffer.toString('utf8') !== 'echo') {
                done(new Error('response mismatch'));
                return;
            }
            done();
        };
        client.send({uuid:uuid().replace(/-/g, ''), buffer:Buffer.from('echo')});        
    });
});