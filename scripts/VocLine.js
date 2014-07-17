function VocalLine(data, noteLength){
	this.data = data;
	this.playing = false;
	this.startTime = null;
	this.noteLength = 1000*noteLength;
	this.margins = findMarginIndices(data);
}

VocalLine.prototype.render = function(ctx){
	ctx.save();
	ctx.strokeStyle = "green";
	ctx.linewidth = 4;
	for(var i = 0; i < this.data.length; i++){
		if(!this.data[i]){continue;}
		var h = noteYPos(this.data[i].note, PianoRoll.lineDiff, PianoRoll.canv.h);
		plotLine(noteLength*i, h, noteLength*(i+1), h);
	}
	ctx.stroke();
	ctx.restore();
};

VocalLine.prototype.update = function(){
	if(true){this.playing = false;}
};

VocalLine.prototype.play = function(ctx){
	if(!G.MIDILoaded){return false;}
	this.playing = true;
	this.startTime = Date.now()*1000;
	for(var i = 0; i < this.data.length; i++){
		if(!data[i]){continue;}
		if(this.margins.starts[i]){this._startNote(this.data[i].note,i);}
		if(this.margins.ends[i]){this._endNote(this.data[i].note,i);}
	}
};

VocalLine.prototype._startNote = function(Note, index){
	MIDI.noteOn(0, Note.getNoteNumber(), 1, (this._delay + this.noteLength*index - this.startTime) + 1000*Date.now());
};

VocalLine.prototype._endNote = function(Note, index){
	MIDI.noteOn(0, Note.getNoteNumber(), (this._delay + this.noteLength*(index+1) - this.startTime) + 1000*Date.now());
};

VocalLine.prototype._delay = 0.5;