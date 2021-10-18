require("isomorphic-fetch");

// eslint-disable-next-line no-undef
window.crypto = {};
// eslint-disable-next-line no-undef
window.crypto.getRandomValues = () => new Uint32Array(1);
