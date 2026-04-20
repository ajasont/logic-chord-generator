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

function applyVoicing(intervals, voicingType) {
  var voiced = intervals.slice();
  if (voicingType === 1) {
    for (var i = 1; i < voiced.length; i += 2) {
      voiced[i] += 12;
    }
  } else if (voicingType === 2) {
    for (var i = 1; i < voiced.length; i++) {
      voiced[i] += 12 * Math.floor((i + 1) / 2);
    }
  }
  return voiced;
}

function clampPitch(pitch) {
  return Math.max(0, Math.min(127, pitch));
}

function buildChordPitches(root, chordTypeIdx, voicingType, transpose, octaveShift) {
  var intervals = getIntervals(chordTypeIdx);
  var voiced = applyVoicing(intervals, voicingType);
  return voiced.map(function(interval) {
    return clampPitch(root + interval + transpose + (octaveShift * 12));
  });
}

// --- VOICING TESTS ---
console.log('\n--- Voicing Tests ---');
assert('Close voicing: major triad unchanged', applyVoicing([0, 4, 7], 0), [0, 4, 7]);
assert('Open voicing: major triad raises index 1', applyVoicing([0, 4, 7], 1), [0, 16, 7]);
assert('Open voicing: maj7 raises indexes 1 and 3', applyVoicing([0, 4, 7, 11], 1), [0, 16, 7, 23]);
assert('Spread voicing: major triad', applyVoicing([0, 4, 7], 2), [0, 16, 19]);

// --- PITCH BUILDING TESTS ---
console.log('\n--- Pitch Building Tests ---');
assert('C4 major triad close voicing no shift: [60,64,67]',
  buildChordPitches(60, 0, 0, 0, 0), [60, 64, 67]);
assert('C4 minor triad close voicing: [60,63,67]',
  buildChordPitches(60, 1, 0, 0, 0), [60, 63, 67]);
assert('C4 major triad transpose +2: [62,66,69]',
  buildChordPitches(60, 0, 0, 2, 0), [62, 66, 69]);
assert('C4 major triad octave +1: [72,76,79]',
  buildChordPitches(60, 0, 0, 0, 1), [72, 76, 79]);
assert('Pitch clamped at 127',
  buildChordPitches(120, 4, 0, 0, 0), [120, 124, 127, 127]);
assert('Pitch clamped at 0',
  buildChordPitches(0, 0, 0, -12, 0), [0, 0, 0]);

// --- SCALE AND PROGRESSION DEFINITIONS ---
var SCALES = {
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Minor': [0, 2, 3, 5, 7, 8, 10],
};

var PATTERN_NAMES = [
  'Classic (I-IV-V-I)',
  'Pop (I-V-vi-IV)',
  'Jazz (ii-V-I)',
  '50s (I-vi-IV-V)',
  'Minor (i-VII-VI-VII)',
  'Blues (i-iv-i-V)',
];
var PATTERNS = [
  [0, 3, 4, 0],
  [0, 4, 5, 3],
  [1, 4, 0],
  [0, 5, 3, 4],
  [0, 6, 5, 6],
  [0, 3, 0, 4],
];

var KEY_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function getProgressionRoot(stepDegree, keyIdx, scaleIdx) {
  var scaleName = scaleIdx === 0 ? 'Major' : 'Minor';
  var degrees = SCALES[scaleName];
  var baseNote = 48 + keyIdx; // C3 = 48
  return baseNote + degrees[stepDegree];
}

function getChordDurationBeats(chordDurationIdx) {
  return [1, 2, 4][chordDurationIdx];
}

// --- SCALE AND PROGRESSION TESTS ---
console.log('\n--- Scale and Progression Tests ---');
assert('6 patterns defined', PATTERNS.length, 6);
assert('6 pattern names defined', PATTERN_NAMES.length, 6);
assert('12 keys defined', KEY_NAMES.length, 12);
assert('Major scale has 7 degrees', SCALES['Major'].length, 7);
assert('Minor scale has 7 degrees', SCALES['Minor'].length, 7);
assert('C major degree 0 root = 48 (C3)', getProgressionRoot(0, 0, 0), 48);
assert('C major degree 4 root = 55 (G3)', getProgressionRoot(4, 0, 0), 55);
assert('G major degree 0 root = 55 (G3)', getProgressionRoot(0, 7, 0), 55);
assert('C minor degree 2 root = 51 (Eb3)', getProgressionRoot(2, 0, 1), 51);
assert('Chord duration idx 0 = 1 beat', getChordDurationBeats(0), 1);
assert('Chord duration idx 1 = 2 beats', getChordDurationBeats(1), 2);
assert('Chord duration idx 2 = 4 beats', getChordDurationBeats(2), 4);
assert('Classic pattern: [0,3,4,0]', PATTERNS[0], [0, 3, 4, 0]);
assert('Jazz pattern: [1,4,0]', PATTERNS[2], [1, 4, 0]);

console.log('\nResults: ' + passed + ' passed, ' + failed + ' failed\n');
