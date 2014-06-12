function Note(initType, data){ // "immutable" note
	var _note, _freq, _noteName, _octave, _cents, _pitch;
	switch(initType){
		case "noteName":
			this._initFromNoteName(data.noteName, data.octave, data.note);
			break;
		case "pitch":
			this._initFromPitch(data.pitch);
			break;
	}
}


Note.prototype._initFromPitch = function(pitch){

	this._note = Math.round(pitch);
	var NN = NoteHandler._noteNameFromNumber(this._note);
	this._noteName = NN.noteName;
	this._octave = NN.octave;

	this._freq = NoteHandler._freqFromPitch(pitch);
	this._pitch = pitch;
	this._cents = Math.round(100*(pitch-this._note));
}

Note.prototype._initFromNoteName = function(noteName, octave, note){

	this._noteName = noteName;
	this._octave = octave;
	this._note = note || NoteHandler._noteNumberFromName(noteName, octave);
	this._freq = NoteHandler._freqFromNoteNumber(note);
	this._cents = 0;
	this._pitch = this._note;
}

Note.prototype.getNoteNumber = function(){
	return this._note;
}

Note.prototype.getCents = function(){
	return this._cents;
}

Note.prototype.getNotePitch = function(){
	return this._pitch;
}

Note.prototype.getNoteName = function(){
	return this._noteName + this._octave;
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
		return this.altNames[name] || name;
	},

	getFromFreq: function(freq){
		var noteNum = this._noteNumberFromFreq(freq);
		var cents = this._computeCents(freq, noteNum);
		var pitch = this._computePitch(noteNum, cents);

		if(this._notes[pitch]){ return this._notes[pitch]; }
		//console.log("New frequency: " + freq);

		var note = new Note("pitch", {pitch: pitch});
		this._notes[pitch] = note;
		return note;
	},

	getFromPitch: function(pitch, log){
		if(this._notes[pitch]){ return this._notes[pitch]; }
		if(log){console.log("new")};
		//console.log("New frequency: " + freq);

		var note = new Note("pitch", {pitch: pitch});
		this._notes[pitch] = note;
		return note;
	},

	getFromNoteName: function(noteName, octave){
		var pitch = this._noteNumberFromName(noteName, octave);

		if(this._notes[pitch]){ return this._notes[pitch]; }
		//console.log("New frequency: " + freq);

		var note = new Note("noteName", {noteName: noteName, octave: octave, note: pitch});
		this._notes[pitch] = note;
		return note;
	},

	_baseFreq: 440,
	_baseOffset: 57,

	_freqFromNoteNumber: function(note){
		return this._baseFreq*Math.pow(2, (note-this._baseOffset)/12);
	},

	_freqFromPitch: function(pitch){
		return this._baseFreq*Math.pow(2, (pitch-this._baseOffset)/12);
	},

	_noteNumberFromName: function(noteName, octave){
		return 12*octave + this.noteNames.indexOf(noteName);
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
	},

	_computePitch: function(note, cents){
		return Number((note + cents*0.01).toFixed(2));
	}
};