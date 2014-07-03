var PianoRoll = new Mode({
	firstInit: function(mic, osc, gain, analy, proc){
		this.canv = initCanvas("render-pianoRoll");
		this.timeScaler = 1000*SAMPLE_SIZE/SAMPLE_RATE;
	},

	init: function(){
		//console.log(this.canv.w - this.frameOffset);
		this.pitchBuffer = new circularBuffer(this.canv.w - this.frameOffset);
	},

	element: "pianoRoll",

	resizeCanvases: function(){
		adjustCanvas(this.canv.canvas);
		this.canv.h = this.canv.canvas.height;
		this.canv.w = this.canv.canvas.width;
	},

	update: function(){
		this.pitchBuffer.add((NoteHandler.getFromFreq(toFreq(G.top)).getNotePitch() - this.toneOffset)*this.lineDiff);
		//console.log(NoteHandler.getFromFreq(toFreq(G.top)).getNotePitch());
	},

	render: function(){
		var ctx = this.canv.ctx;

		ctx.clearRect(0,0,this.canv.w,this.canv.h);
		this.readyCanvas(ctx);

		var circBuffEnd = this.drawBuffer(ctx);
	}
});

PianoRoll.readyCanvas = function(ctx){
	ctx.beginPath();
	ctx.moveTo(0, 250);
	ctx.lineTo(this.canv.w, 250);
	ctx.stroke();
};

PianoRoll.drawBuffer = function(ctx){
	//console.log("here");
	ctx.save();
	ctx.strokeStyle = "blue";
	ctx.beginPath();
	ctx.moveTo(0, this.canv.h/2 - (this.pitchBuffer.get(0) - this.toneOffset)*this.lineDiff);
	var i;
	for(i = 1; i < this.pitchBuffer.len; i++){	
		if(!isNaN(this.pitchBuffer.get(i))){
			//Do stuff
			ctx.lineTo(i, this.canv.h/2 - this.pitchBuffer.get(i));
			//console.log(i);
			//console.log((this.canv.h - this.buffer.get(i))*this.lineDiff)
		} else {
			break;
		}
	}
	ctx.stroke();
	ctx.restore();
	return i;
};

PianoRoll.pitchBuffer = undefined;
PianoRoll.canv = undefined;
PianoRoll.lineDiff = 10;
PianoRoll.toneOffset = 57;
PianoRoll.frameOffset = 50;
PianoRoll.timeScaler = undefined;