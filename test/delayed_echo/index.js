const InstantClient = require('../../client/instant');
const PersistentClient = require('../../client/persistent');

const port = 8212;

describe("#tcp-framework-instant", function() {
    this.timeout(15000);
    
    it('should return without error within 1 sec using instant mode', async () => {
        let client = new InstantClient({port});
        client.request(Buffer.from('delayed_echo'), 1000).then(() => {
            assert(false, "should not be responded within 1 sec");
        }).catch(err => {
        });
    });
    it('should return without error within 1 sec using persistent mode', async () => {
        let client = new PersistentClient({port});
        client.request(Buffer.from('delayed_echo'), 1000).then(() => {
            assert(false, "should not be responded within 1 sec");
        }).catch(err => {
        });
    });
    it('should return without error within 3 sec using instant mode', async () => {
        let client = new InstantClient({port});
        let responsePayload = await client.request(Buffer.from('delayed_echo'), 4000);
        assert(responsePayload.toString('utf8') === 'delayed_echo');
    });
    it('should return without error within 3 sec using persistent mode', async () => {
        let client = new PersistentClient({port});
        let responsePayload = await client.request(Buffer.from('delayed_echo'), 4000);
        assert(responsePayload.toString('utf8') === 'delayed_echo');
    });
});