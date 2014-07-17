function VocalLine(data, noteLength){
	this.data = data;
	this.playing = false;
	this.startTime = null;
	this.noteLength = noteLength;
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