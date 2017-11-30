const EchoInstantClient = require('../../../examples/echo/instant_client.js');

describe("#tcp-framework-instant", function() {
    this.timeout(5000);
    it('should return [hello, world]', async () => {
        let client = new EchoInstantClient();
        let responsePayload = await client.request(Buffer.from('hello, world'));
        let response = responsePayload.toString('utf8');
        assert(response === 'hello, world');
    });
});