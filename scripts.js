var keys = []; // an 88-long boolean list where true represents a key that is selected
var whiteKeyIndexes = []; // a list of indexes to convert from white key indexes to key indexes
var blackKeyIndexes = [];
const notesInOctave = ["A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab"];
const notesByString = ["E", "A", "D", "G", "B", "E"];
const canvasWidth = 300;
const canvasHeight = 315;
var c;
var ctx;
for (var i = 0; i < 88; i++) {
    keys.push(false);
    var whiteKeysInOctave = [0, 2, 3, 5, 7, 8, 10];
    var relativeIndex = i % 12;
    if (whiteKeysInOctave.includes(relativeIndex)) {
        whiteKeyIndexes.push(i);
    } else {
        blackKeyIndexes.push(i);
    }
}

window.onload = function () {
    // var keys = ["A", "B", "C", "D", "E", "F", "G"];
    // for (var i = 0; i < 52; i++) {
    //     document.getElementById("white-keys").innerHTML += `<div id=\"white-${i}\" class=\"white-key\" onclick=\"selectWhiteKey(this.id)\"><p>${keys[i % 7]}</p></div>`;
    // }
    // for (var i = 0; i < 36; i++) {
    //     document.getElementById("black-keys").innerHTML += `<div id=\"black-${i}\" class=\"black-key\" onclick=\"selectBlackKey(this.id)\"></div>`;
    //     if (i % 5 == 0 || i % 5 == 2) {
    //         document.getElementById("black-keys").innerHTML += "<div class=\"black-key-spacer\">";
    //     }
    // }
    c = document.getElementById("chord-diagram");
    ctx = c.getContext("2d");
}

function selectWhiteKey (id) {
    var element = document.getElementById(id);
    if (element.className == "white-key") {
        keys[whiteKeyIndexes[getIndexFromID(id)]] = true;
        element.className = "white-key-selected";
    } else {
        keys[whiteKeyIndexes[getIndexFromID(id)]] = false;
        element.className = "white-key";
    }
    getChord();
}

function selectBlackKey (id) {
    var element = document.getElementById(id);
    if (element.className == "black-key") {
        keys[blackKeyIndexes[getIndexFromID(id)]] = true;
        element.className = "black-key-selected";
    } else {
        keys[blackKeyIndexes[getIndexFromID(id)]] = false;
        element.className = "black-key";
    }
    getChord();
}

function getIndexFromID (id) {
    return parseInt(id.split("-")[1]);
}

function getChord () {
    var keysInChord = [];
    for (var i = 0; i < keys.length; i++) {
        if (keys[i]) {
            keysInChord.push(notesInOctave[i % 12]);
        }
    }
    if (keysInChord.length == 0) {
        document.getElementById("chord-display").innerHTML = "";
        return;
    }
    var root = keysInChord[0];
    var chord = root;
    document.getElementById("chord-display").innerHTML = chord;
}

function drawChordDiagramBase () {
    ctx.lineWidth = 3;
    // vertical lines
    for (var i = 0; i < 6; i++) {
        drawLine(50 + 40*i, 100, 50 + 40*i, canvasHeight-15);
    }
    // horizontal lines
    for (var i = 0; i < 5; i++) {
        drawLine(50, 100 + 50*i, canvasWidth-50, 100 + 50*i);
    }
}

function drawLine (x1, y1, x2, y2) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawOutlinedCircle (x, y) {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2*Math.PI);
    ctx.stroke();
}

function drawFilledCircle (x, y) {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
}

function drawX (x, y) {
    ctx.lineWidth = 2;
    var sin45 = Math.sin(Math.PI/4)*10;
    drawLine(x-sin45, y-sin45, x+sin45, y+sin45);
    drawLine(x-sin45, y+sin45, x+sin45, y-sin45);
}

function drawChordDiagramMarkings (markings, chordName) { // markings is a int list where -1 = X, 0 = O, and any positive integer represents how far down to go
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText(chordName, 150, 50);
    for (var i = 0; i < markings.length; i++) {
        if (markings[i] == -1) {
            drawX(50 + 40*i, 75);
        } else if (markings[i] == 0) {
            drawOutlinedCircle(50 + 40*i, 75);
        } else {
            drawFilledCircle(50 + 40*i, 75 + 50*markings[i])
        }
    }
}

function drawChordDiagram (markings, chordName) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawChordDiagramBase();
    drawChordDiagramMarkings(markings, chordName);
}

function shiftNote (startNote, shift) {
    return notesInOctave[(notesInOctave.indexOf(startNote) + shift) % 12];
}

function noteRange (startNote, length) {
    range = [];
    for (var i = 0; i < length; i++) {
        var adjustedI = (notesInOctave.indexOf(startNote) + i) % 12;
        range.push(notesInOctave[adjustedI]);
    }
    return range;
}

function generateChordWithRootAndNotes (root, notes) { // notes is a boolean list of 12 notes that should be included
    var markings = [0, 0, 0, 0, 0, 0];
    var needRootAtBase = true;
    var rootStringIndex = 0; // index representing the string that can play the root
    for (var i = 0; i < notesByString.length; i++) {
        var note = notesByString[i];
        var currentRange = noteRange(note, 5);
        if (needRootAtBase && currentRange.includes(root)) {
            markings[i] = currentRange.indexOf(root);
            needRootAtBase = false;
        } else {
            if (needRootAtBase) {
                markings[rootStringIndex] = -1;
                rootStringIndex++; 
            } else {
                for (var j = 0; j < notes.length; j++) {
                    if (notes[j]) {
                        var currentNote = shiftNote(root, j);
                        if (currentRange.includes(currentNote)) {
                            markings[i] = currentRange.indexOf(currentNote);
                            break;
                        }
                    }
                }
            }
        }
    }
    return markings;
}

function generateChord () {
    // Get chord name and display error message if necessary
    var chordName = document.getElementById("chord-input-box").value;
    if (chordName == "") {
        document.getElementById("error-message").innerHTML = "Please enter a valid chord name";
    } else {
        document.getElementById("error-message").innerHTML = "";
    }

    // Classify the chord type
    chordType = "other";
    if (chordName.length == 1) {
        chordType = "major";
    } else if (chordName.length == 2 && chordName[1] == "m") {
        chordType = "minor";
    }

    // Generate the chord based on the type
    var markings = [0, 0, 0, 0, 0, 0];
    if (chordType == "major") {
        markings = generateChordWithRootAndNotes(chordName, [true, false, false, false, true, false, false, true, false, false, false, false]);
    } else if (chordType == "minor") {
        markings = generateChordWithRootAndNotes(chordName[0], [true, false, false, true, false, false, false, true, false, false, false, false]);
    }
    drawChordDiagram(markings, chordName);
}