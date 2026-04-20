// test.js — run with: node test.js
var passed = 0;
var failed = 0;

function assert(description, actual, expected) {
  var ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log('  PASS: ' + description);
    passed++;
  } else {
    console.log('  FAIL: ' + description);
    console.log('    expected: ' + JSON.stringify(expected));
    console.log('    actual:   ' + JSON.stringify(actual));
    failed++;
  }
}

// --- CHORD DEFINITIONS ---
var CHORD_TYPES = {
  'Major':       [0, 4, 7],
  'Minor':       [0, 3, 7],
  'Diminished':  [0, 3, 6],
  'Augmented':   [0, 4, 8],
  'Major 7':     [0, 4, 7, 11],
  'Minor 7':     [0, 3, 7, 10],
  'Dominant 7':  [0, 4, 7, 10],
  'Major 9':     [0, 4, 7, 11, 14],
  'Minor 9':     [0, 3, 7, 10, 14],
  'Dominant 9':  [0, 4, 7, 10, 14],
  'Major 11':    [0, 4, 7, 11, 14, 17],
  'Minor 11':    [0, 3, 7, 10, 14, 17],
  'Dominant 11': [0, 4, 7, 10, 14, 17],
  'Sus2':        [0, 2, 7],
  'Sus4':        [0, 5, 7],
  'Dom7Sus4':    [0, 5, 7, 10],
  'Add9':        [0, 4, 7, 14],
  'Minor Add9':  [0, 3, 7, 14],
  'Dim 7':       [0, 3, 6, 9],
  'Half-Dim 7':  [0, 3, 6, 10],
};
var CHORD_NAMES = Object.keys(CHORD_TYPES);

function getIntervals(chordTypeIdx) {
  if (chordTypeIdx < 0 || chordTypeIdx >= CHORD_NAMES.length) {
    return [0];
  }
  return CHORD_TYPES[CHORD_NAMES[chordTypeIdx]].slice();
}

// --- CHORD INTERVAL TESTS ---
console.log('\n--- Chord Interval Tests ---');
assert('20 chord types defined', CHORD_NAMES.length, 20);
assert('Major intervals', getIntervals(0), [0, 4, 7]);
assert('Minor intervals', getIntervals(1), [0, 3, 7]);
assert('Major 7 intervals', getIntervals(4), [0, 4, 7, 11]);
assert('Dominant 9 intervals', getIntervals(9), [0, 4, 7, 10, 14]);
assert('Sus2 intervals', getIntervals(13), [0, 2, 7]);
assert('Dim 7 intervals', getIntervals(18), [0, 3, 6, 9]);
assert('Half-Dim 7 intervals', getIntervals(19), [0, 3, 6, 10]);
assert('All chords start on root (0)', CHORD_NAMES.every(function(name) {
  return CHORD_TYPES[name][0] === 0;
}), true);
assert('Out-of-bounds index returns [0]', getIntervals(99), [0]);

console.log('\nResults: ' + passed + ' passed, ' + failed + ' failed\n');
