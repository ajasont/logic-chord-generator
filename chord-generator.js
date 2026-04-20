var NeedsTimingInfo = true;

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

// ============================================================
// SCALE AND PROGRESSION DEFINITIONS
// ============================================================
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

// ============================================================
// SCRIPTER PARAMETERS (11 total)
// ============================================================
var PluginParameters = [
  // index 0
  { name: 'Chord Type',      type: 'menu', valueStrings: CHORD_NAMES,   defaultValue: 0 },
  // index 1
  { name: 'Voicing',         type: 'menu', valueStrings: ['Close', 'Open', 'Spread'], defaultValue: 0 },
  // index 2
  { name: 'Transpose',       type: 'lin',  minValue: -12, maxValue: 12,  numberOfSteps: 24,  defaultValue: 0 },
  // index 3
  { name: 'Octave',          type: 'lin',  minValue: -2,  maxValue: 2,   numberOfSteps: 4,   defaultValue: 0 },
  // index 4
  { name: 'Progression On',  type: 'checkbox', defaultValue: 0 },
  // index 5
  { name: 'Key',             type: 'menu', valueStrings: KEY_NAMES,      defaultValue: 0 },
  // index 6
  { name: 'Scale',           type: 'menu', valueStrings: ['Major', 'Minor'], defaultValue: 0 },
  // index 7
  { name: 'Pattern',         type: 'menu', valueStrings: PATTERN_NAMES,  defaultValue: 0 },
  // index 8
  { name: 'Chord Duration',  type: 'menu', valueStrings: ['1 beat', '2 beats', '4 beats'], defaultValue: 0 },
  // index 9
  { name: 'Prog Chord Type', type: 'menu', valueStrings: CHORD_NAMES,   defaultValue: 0 },
  // index 10
  { name: 'Velocity',        type: 'lin',  minValue: 1,   maxValue: 127, numberOfSteps: 126, defaultValue: 100 },
];

// ============================================================
// STATE
// ============================================================
var state = {
  chordTypeIdx:    0,
  voicing:         0,
  transpose:       0,
  octave:          0,
  progressionOn:   false,
  key:             0,
  scale:           0,
  patternIdx:      0,
  chordDuration:   0,
  progChordTypeIdx: 0,
  velocity:        100,
  activeNotes:     {},   // root pitch -> [chord pitches] for trigger mode
  progNotes:       [],   // currently sounding progression chord pitches
  progStep:        0,    // current index into the active pattern
  lastBoundary:    -1,   // last beat boundary where a progression chord fired
};

// ============================================================
// PARAMETER CHANGE HANDLER
// ============================================================
function ParameterChanged(param, value) {
  switch (param) {
    case 0:  state.chordTypeIdx = value; break;
    case 1:  state.voicing = value; break;
    case 2:  state.transpose = value; break;
    case 3:  state.octave = value; break;
    case 4:
      state.progressionOn = (value === 1);
      if (!state.progressionOn && typeof stopNotes !== 'undefined') {
        stopNotes(state.progNotes);
        state.progNotes = [];
        state.lastBoundary = -1;
        state.progStep = 0;
      }
      break;
    case 5:  state.key = value; break;
    case 6:  state.scale = value; break;
    case 7:  state.patternIdx = value; state.progStep = 0; break;
    case 8:  state.chordDuration = value; break;
    case 9:  state.progChordTypeIdx = value; break;
    case 10: state.velocity = value; break;
  }
}

// ============================================================
// MIDI HELPERS
// (NoteOn/NoteOff are Scripter globals — not available in Node.js)
// ============================================================
function sendNotes(pitches, velocity) {
  for (var i = 0; i < pitches.length; i++) {
    var note = new NoteOn();
    note.pitch = pitches[i];
    note.velocity = velocity;
    note.send();
  }
}

function stopNotes(pitches) {
  for (var i = 0; i < pitches.length; i++) {
    var note = new NoteOff();
    note.pitch = pitches[i];
    note.velocity = 0;
    note.send();
  }
}

// ============================================================
// TRIGGER MODE — HandleMIDI
// ============================================================
function HandleMIDI(event) {
  if (event instanceof NoteOn) {
    var root = event.pitch;
    var pitches = buildChordPitches(
      root,
      state.chordTypeIdx,
      state.voicing,
      state.transpose,
      state.octave
    );
    sendNotes(pitches, event.velocity);
    state.activeNotes[root] = pitches;

  } else if (event instanceof NoteOff) {
    var root = event.pitch;
    if (state.activeNotes[root]) {
      stopNotes(state.activeNotes[root]);
      delete state.activeNotes[root];
    }
  } else {
    event.send();
  }
}

// ============================================================
// PROGRESSION ENGINE
// ============================================================
function fireProgressionChord() {
  if (state.progNotes.length > 0) {
    stopNotes(state.progNotes);
    state.progNotes = [];
  }

  var pattern = PATTERNS[state.patternIdx];
  var degree  = pattern[state.progStep];
  var root    = getProgressionRoot(degree, state.key, state.scale);
  var pitches = buildChordPitches(
    root,
    state.progChordTypeIdx,
    state.voicing,
    state.transpose,
    state.octave
  );

  sendNotes(pitches, state.velocity);
  state.progNotes = pitches;
  state.progStep  = (state.progStep + 1) % pattern.length;
}

function ProcessMIDI() {
  var info = GetTimingInfo();

  if (!info.playing) {
    if (state.progNotes.length > 0) {
      stopNotes(state.progNotes);
      state.progNotes  = [];
      state.lastBoundary = -1;
      state.progStep   = 0;
    }
    return;
  }

  if (!state.progressionOn) return;

  var duration = getChordDurationBeats(state.chordDuration);
  var beatPos  = info.blockStartBeat;
  var boundary = Math.floor(beatPos / duration) * duration;

  if (boundary > state.lastBoundary) {
    state.lastBoundary = boundary;
    fireProgressionChord();
  }
}
