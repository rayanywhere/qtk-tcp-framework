module.exports = class {
	static get Server() {
		return require('./server');
	}

	static get Client() {
		return require('./client');
	}
};
