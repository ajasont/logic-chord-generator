// ============================================================
// CHORD DEFINITIONS
// ============================================================
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

// ============================================================
// VOICING AND PITCH BUILDING
// ============================================================
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
