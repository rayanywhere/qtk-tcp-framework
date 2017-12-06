const InstantClient = require('../../client/instant');
const PersistentClient = require('../../client/persistent');

const port = 8212

describe("#tcp-framework-instant", function() {
    it('should return [echo] using instant mode', async () => {
        let client = new InstantClient({port});
        let responsePayload = await client.request(Buffer.from('echo'));
        assert(responsePayload.toString('utf8') === 'echo');
    });
    it('should return [echo] using persistent mode', async () => {
        let client = new PersistentClient({port});
        let responsePayload = await client.request(Buffer.from('echo'));
        assert(responsePayload.toString('utf8') === 'echo');
    });
});