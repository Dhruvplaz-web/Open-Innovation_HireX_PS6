// Monkeypatch for Node v26 + npm minipass incompatibility
try {
  const Module = require('module');
  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    const exports = originalLoad.apply(this, arguments);
    if (exports && typeof exports === 'function' && !exports.Minipass && exports.name === 'Minipass') {
      exports.Minipass = exports;
    }
    return exports;
  };
} catch (e) {}
