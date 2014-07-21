function Melody(data, noteLength){
	this.data = fixVocLineData(data);
	this.playing = false;
	this.startPlayTime = null;
	this.timeElapsed = 0;
	this.noteLength = noteLength/1000;
	this.margins = findMarginIndices(data);
	this.timeLength = this.noteLength*this.data.length;
	this.recording = false;
}

Melody.prototype.render = function(ctx){
	ctx.save();
	ctx.strokeStyle = "green";
	ctx.linewidth = 4;
	var multiplier = this.noteLength*1000*PianoRoll.timeScaler;
	for(var i = 0; i < this.data.length; i++){
		if(!this.data[i]){continue;}
		var h = noteYPos(this.data[i].note, PianoRoll.lineDiff, PianoRoll.canv.h);
		plotLine(multiplier*i, h, multiplier*(i+1), h);
	}
	ctx.stroke();
	ctx.restore();
};

Melody.prototype.update = function(){
	if(this.playing || this.recording){
		this.timeElapsed = Date.now()/1000 - this.startPlayTime;
		if(this.timeElapsed > (this.timeLength + (this.playing ? 0.5 : 0))){
			if(this.playing){this.stopPlay();}
			if(this.recording){this.stopRec();}
			return;
		}
	}
};

Melody.prototype.getTarget = function(){
	if(!this.recording){return false;}
	var index = Math.floor(this.timeElapsed/this.noteLength);
	if(!this.data[index]) return false;
	return this.data[index].note;
};

Melody.prototype.firstTarget = function(){
	return this.data[0].note;
};

Melody.prototype.rec = function(){
	this.recording = true;
	this.startTime = Date.now()/1000;
};

Melody.prototype.play = function(){
	if(!G.MIDILoaded){return false;}
	this.playing = true;
	this.startPlayTime = Date.now()/1000;
	for(var i = 0; i < this.data.length; i++){
		if(!data[i]){continue;}
		if(this.margins.starts[i]){this._startNote(this.data[i].note,i);}
		if(this.margins.ends[i]){this._endNote(this.data[i].note,i);}
	}
};

Melody.prototype.stopPlay = function(){
	MIDI.Player.stopAllNotes();
	this.playing = false;
	this.startPlayTime = undefined;
	this.timeElapsed = 0;
};

Melody.prototype._startNote = function(Note, index){
	MIDI.noteOn(0, Note.getNoteNumber(), 1, (this._delay + this.noteLength*index - this.startPlayTime) + Date.now()/1000);
};

Melody.prototype._endNote = function(Note, index){
	MIDI.noteOn(0, Note.getNoteNumber(), (this._delay + this.noteLength*(index+1) - this.startPlayTime) + Date.now()/1000);
};

Melody.prototype._delay = 0.5;