const genuuid = require('uuid/v4');

module.exports = class Message {
	static get SIGN_PING() { return 0x01; }
	static get SIGN_DATA() { return 0x11; }

	constructor(sign, payload = null, uuid = null) {
		this._sign = sign;
		this._payload = (payload === null) ? new Buffer('') : payload;
		this._uuid = (uuid === null) ? genuuid().replace(/-/g, '') : uuid;
	}

	get sign() { return this._sign; }
	get uuid() { return this._uuid; }
	get payload() { return this._payload; }

	toBuffer() {
		let signBuf = Buffer.alloc(1);
		signBuf.writeUInt8(this._sign, 0);

		let uuidBuf = Buffer.from(this._uuid);

		let lengthBuf = Buffer.alloc(4);
		lengthBuf.writeUInt32BE(this._payload.length);
		
		return Buffer.concat([signBuf, uuidBuf, lengthBuf, this._payload]);
	}

	static parse(buffer) {
		if (buffer.length < 37) {
			return {consumed: 0, message:null};
		}
		let sign = buffer.readUInt8(0);
		let uuid = buffer.slice(1, 33);
		let length = buffer.readUInt32BE(33);

		if ((sign !== Message.SIGN_PING) && (sign !== Message.SIGN_DATA)) {
			throw new Error('expect packet to start with SIGN_PING || SIGN_DATA');
		}
		if (buffer.length < (37 + length)) {
			return {consumed: 0, message:null};
		}

		let payload = buffer.slice(37, 37 + length);
		return {consumed:37 + length, message: new Message(sign, payload, uuid.toString())};
	}
}
