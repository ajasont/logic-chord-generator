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

// --- CHORD DEFINITIONS (copy from chord-generator.js as it grows) ---

// --- TESTS WILL BE ADDED IN SUBSEQUENT TASKS ---

console.log('\nResults: ' + passed + ' passed, ' + failed + ' failed\n');
