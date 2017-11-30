const EchoPersistentClient = require('../../../examples/echo/persistent_client.js');

describe("#tcp-framework-persistent", function() {
    this.timeout(5000);

    it('should return [hello, world]', async () => {
        let client = new EchoPersistentClient();
        let responsePayload = await client.request(Buffer.from('hello, world'));
        let response = responsePayload.toString('utf8');
        assert(response === 'hello, world');
    });
});