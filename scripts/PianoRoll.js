var PianoRoll = new Mode({
	firstInit: function(mic, osc, gain, analy, proc){
		this.canv = initCanvas("render-pianoRoll");
		this.timeScaler = 1/1000*SAMPLE_RATE/SAMPLE_SIZE;
	},

	init: function(){
		//console.log(this.canv.w - this.frameOffset);
		this.frameOffset = Math.floor(this.canv.w*0.1);
		this.pitchBuffer = new circularBuffer(this.frameOffset+100);
		this.timeBuffer = new circularBuffer(this.frameOffset+100);
		this.translate = false;
		this.startTime = Date.now()*this.timeScaler;
	},

	element: "pianoRoll",

	resizeCanvases: function(){
		adjustCanvas(this.canv.canvas);
		this.canv.h = this.canv.canvas.height;
		this.canv.w = this.canv.canvas.width;
	},

	update: function(){
		this.timeBuffer.add(Date.now()*this.timeScaler - this.startTime);
		this.pitchBuffer.add((NoteHandler.getFromFreq(toFreq(G.top)).getNotePitch() - this.toneOffset)*this.lineDiff);
		//console.log(NoteHandler.getFromFreq(toFreq(G.top)).getNotePitch());
		if(this.translate || !(this.timeBuffer.get(-1) >= this.frameOffset)){
			// Do nothing, slightly faster to go into the positive more often than not
			// which it does every time except once
		} else {
			this.translate = true;
		}

		this.cameraOffset = this.translate ? this.frameOffset - this.timeBuffer.get(-1) : 0;
	},

	render: function(){
		var ctx = this.canv.ctx;

		ctx.clearRect(0,0,this.canv.w,this.canv.h);
		this.drawLines(ctx);

		this.panCam(ctx);

		this.drawBuffer(ctx);

		ctx.restore();
	}
});

PianoRoll.drawLines = function(ctx){
	var baseHeight = this.canv.h/2 - 5.5*this.lineDiff;
	ctx.beginPath();
	for(var i = 0; i < 12; i++){
		var h = baseHeight + i*this.lineDiff;
		plotLine(ctx, 0, h, this.canv.w, h);
	}
	ctx.stroke();
};

PianoRoll.panCam = function(ctx){
	ctx.save();
	ctx.translate(this.cameraOffset,0);
};

PianoRoll.drawBuffer = function(ctx){
	//console.log("here");
	ctx.strokeStyle = "blue";
	ctx.beginPath();
	ctx.moveTo(this.timeBuffer.get(0), this.canv.h/2 - this.pitchBuffer.get(0));
	for(var i = 1; i < this.pitchBuffer.getEnd(); i++){
		ctx.lineTo(this.timeBuffer.get(i), this.canv.h/2 - this.pitchBuffer.get(i));
	}
	ctx.stroke();
};

PianoRoll.pitchBuffer = undefined;
PianoRoll.timeBuffer = undefined;
PianoRoll.startTime = undefined;
PianoRoll.canv = undefined;
PianoRoll.lineDiff = 16;
PianoRoll.toneOffset = 57;
PianoRoll.frameOffset = 50;
PianoRoll.timeScaler = undefined;
PianoRoll.translate = false;