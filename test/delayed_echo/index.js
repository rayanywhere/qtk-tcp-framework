const InstantClient = require('../../client/instant');
const PersistentClient = require('../../client/persistent');
const uuid = require('uuid/v4');

const port = 8212;

describe("#tcp-framework-instant", function() {
    this.timeout(15000);
    
    it('[using instant mode] should return without error within 1 sec', async function () {
        let client = new InstantClient({port});
        client.request(Buffer.from('delayed_echo'), 1000).then(() => {
            assert(false, "should not be responded within 1 sec");
        }).catch(err => {
        });
    });
    it('[using instant mode] should return without error within 3 sec', async function () {
        let client = new InstantClient({port});
        let responsePayload = await client.request(Buffer.from('delayed_echo'), 4000);
        assert(responsePayload.toString('utf8') === 'delayed_echo');
    });
    it('[using persistent mode] should return without error after 3 sec', function (done) {
        const client = new PersistentClient({port});
        const timeStart = new Date();
        client.onData = ({uuid, buffer}) => {
            if (buffer.toString('utf8') !== 'delayed_echo') {
                done(new Error('response mismatch'));
                return;
            }

            const timeEnd = new Date();
            if (timeEnd - timeStart < 3000) {
                done(new Error('should not be responded within 3 sec'));
                return;
            }
            done();
        };
        client.send({uuid:uuid().replace(/-/g, ''), buffer:Buffer.from('delayed_echo')});        
    });
});