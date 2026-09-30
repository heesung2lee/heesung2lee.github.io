/* TourState.js — single source of truth (Strangler step 1).
   All cross-file shared state lives here. Read via TourState.get(key),
   write via TourState.set(key, value) which fires a CustomEvent
   ('tourstate:' + key) so dependents update without direct calls.
   Legacy globals still work: they proxy to this store. */
var TourState = (function() {
  var store = {
    curLang: 'ko',
    F_fi: 0,
    F_qi: 0,
    F_flow: [],
    F_answers: {},
    crsQi: 0,
    crsQs: { views: 0, skill: 0, vibe: 0, challenge: 0, comfort: 0 },
    crsCur: 'usa',
    crsRegionCur: 'usa1',
    crsProgScroll: false,
    SITE: null
  };
  function emit(key, value) {
    try {
      document.dispatchEvent(new CustomEvent('tourstate:' + key, { detail: value }));
    } catch (e) {}
  }
  return {
    get: function(key) { return store[key]; },
    set: function(key, value) { store[key] = value; emit(key, value); return value; },
    on: function(key, fn) { document.addEventListener('tourstate:' + key, function(e) { fn(e.detail); }); },
    _store: store
  };
})();
