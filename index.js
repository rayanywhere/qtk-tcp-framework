module.exports = class {
	static get Server() {
		return require('./server');
	}

	static get InstantClient() {
		return require('./client/instant.js');
	}

    static get PersistentClient() {
        return require('./client/persistent.js');
    }
};
