function Note(initType, data){ // "immutable" note
	var _note, _freq, _noteName, _octave, _cents;
	switch(initType){
		case "freq":
			this._initFromFreq(data.freq);
			break;
		case "noteName":
			this._initFromNoteName(data.noteName, data.octave, data.freq, data.note);
			break;
		case "note":
			this._initFromNote(data.note, data.freq);
			break;
	}
}


Note.prototype._initFromNote = function(note, freq){

	var NN = NoteHandler._noteNameFromNumber(note);
	this._noteName = NN.noteName;
	this._octave = NN.octave;

	this._note = note;
	this._freq = freq || NoteHandler._freqFromNoteNumber(note);
	this._cents = 0;
}

Note.prototype._initFromNoteName = function(noteName, octave, freq, note){

	this._noteName = noteName;
	this._octave = octave;
	this._note = note || NoteHandler._noteNumberFromName(noteName, octave);
	this._freq = freq || NoteHandler._freqFromNoteNumber(note);
	this._cents = 0;
}

Note.prototype._initFromFreq = function(freq){

	this._freq = freq;
	this._note = NoteHandler._noteNumberFromFreq(freq);
	var NN = NoteHandler._noteNameFromNumber(this._note);
	this._noteName = NN.noteName;
	this._octave = NN.octave;
	this._cents = NoteHandler._computeCents(freq, this._note);
}

Note.prototype.getNoteNumber = function(){
	return this._note;
}

Note.prototype.getNoteName = function(){
	return this._noteName + this._octave;
}

Note.prototype.getCents = function(){
	return this._cents;
}

Note.prototype.getFreq = function(){
	return this._freq;
}

var NoteHandler = {

	_notes: [],

	noteNames: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "H"],

	altNames: {
		"A#": "Bb",
		"C#": "Db",
		"D#": "Eb",
		"F#": "Gb",
		"G#": "Ab"
	},

	altName: function(name){
		return altNames[name] || name;
	},

	getFromFreq: function(freq){
		if(this._notes[freq]){ return this._notes[freq]; }
		console.log("New frequency: " + freq);

		var note = new Note("freq", {freq: freq});
		this._notes[freq] = note;
		return note;
	},

	getFromNote: function(noteNum){
		var freq = this._freqFromNoteNumber(noteNum);
		if(this._notes[freq]){ return this._notes[freq]; }
		console.log("New frequency: " + freq);

		var note = new Note("note", {note: noteNum, freq: freq});
		this._notes[freq] = note;
		return note;
	},

	getFromNoteName: function(noteName, octave){
		var ans = this._freqFromNoteName(noteName, octave);

		if(this._notes[ans.freq]){ return this._notes[ans.freq]; }
		console.log("New frequency: " + freq);

		var note = new Note("noteName", {noteName: noteName, octave: octave, freq: ans.freq, note: and.note});
		this._notes[freq] = note;
		return note;
	},

	_baseFreq: 440,
	_baseOffset: 57,

	_freqFromNoteNumber: function(note){
		return this._baseFreq*Math.pow(2, (note-this._baseOffset)/12);
	},

	_noteNumberFromName: function(noteName, octave){
		return 12*octave + noteNames.indexOf(noteName);
	},

	_freqFromNoteName: function(noteName, octave){
		var note = this._noteNumberFromName(noteName,octave);
		return {freq: this._freqFromNoteNumber(), note: note};
	},

	_noteNameFromNumber: function(note){
		var name = this.noteNames[note%12];
		var oct = Math.floor(note/12);//+1?
		return {
			noteName: name,
			octave: oct
		};
	},

	_noteNumberFromFreq: function(freq){
		return Math.round( 12*( Math.log(freq/this._baseFreq)/Math.log(2) ) ) + this._baseOffset;
	},

	_computeCents: function(freq, note){
		return Math.round(1200*Math.log(freq / this._freqFromNoteNumber(note))/Math.log(2));
	}
};