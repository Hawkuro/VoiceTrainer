var PianoRoll = new Mode({
	firstInit: function(mic, osc, gain, analy, proc){
		this.canv = initCanvas("render-pianoRoll");
		this.timeScaler = 1/1000*SAMPLE_RATE/SAMPLE_SIZE;
	},

	init: function(){
		//console.log(this.canv.w - this.frameOffset);
		this.frameOffset = Math.floor(this.canv.w*0.1);
		this.canv.ctx.lineWidth = 2;
	},

	element: "pianoRoll",

	resizeCanvases: function(){
		adjustCanvas(this.canv.canvas);
		this.canv.h = this.canv.canvas.height;
		this.canv.w = this.canv.canvas.width;
		if(this.voiceStarted){
			this.resizeBuffers(this.canv.w + 100);
		}
	},

	update: function(){
		if(this.voiceStarted){
			var currTime = Date.now()*this.timeScaler - this.startTime; // Time from start
			this.timeBuffer.add(currTime);
			this.pitchBuffer.add((NoteHandler.getFromFreq(toFreq(G.top)).getNotePitch() - this.toneOffset)*this.lineDiff);
			//console.log(NoteHandler.getFromFreq(toFreq(G.top)).getNotePitch());
			if(this.translate || !(this.timeBuffer.get(-1) >= this.frameOffset)){
				// Do nothing, slightly faster to go into the positive more often than not
				// which it does every time except once
			} else {
				this.translate = true;
			}

			this.cameraOffset = this.translate ? this.frameOffset - this.timeBuffer.get(-1) : 0;
		} else if(this.shouldStart()) {
			this.startVoice();
		}
	},

	render: function(){
		var ctx = this.canv.ctx;

		ctx.clearRect(0,0,this.canv.w,this.canv.h);
		this.drawLines(ctx);

		this.panCam(ctx);

		if(this.voiceStarted || this.voiceStopped){
			this.drawBuffer(ctx);
		}

		ctx.restore();
	}
});

PianoRoll.shouldStart = function(){
	var i = Math.floor(G.top);
	return Math.max(G.fftAn.spectrum[i], G.fftAn.spectrum[i+1]) > PIANO_ROLL_START_THRESHHOLD;
};

PianoRoll.startVoice = function(){
	this.voiceStopped = false;
	this.voiceStarted = true;
	this.pitchBuffer = new circularBuffer(this.frameOffset+100);
	this.timeBuffer = new circularBuffer(this.frameOffset+100);
	this.translate = false;
	this.startTime = Date.now()*this.timeScaler;
};

PianoRoll.stopVoice = function(){
	this.voiceStarted = false;
	this.voiceStopped = true;
};

PianoRoll.drawLines = function(ctx){
	//var baseHeight = this.canv.h/2 - 5.5*this.lineDiff;
	ctx.beginPath();
	for(var i = 0; i < 13; i++){
		var h = noteYPos(NoteHandler.getFromPitch(63+i), this.lineDiff, this.canv.h);//baseHeight + i*this.lineDiff;
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
	ctx.lineWidth = 4;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.beginPath();
	ctx.moveTo(this.timeBuffer.get(0), this.canv.h/2 - this.pitchBuffer.get(0));
	for(var i = 1; i < this.pitchBuffer.getEnd(); i++){
		ctx.lineTo(this.timeBuffer.get(i), this.canv.h/2 - this.pitchBuffer.get(i));
	}
	ctx.stroke();
};

PianoRoll.resizeBuffers = function(newSize){
	this.timeBuffer.resize(newSize);
	this.pitchBuffer.resize(newSize);
}

PianoRoll.pitchBuffer = undefined;
PianoRoll.timeBuffer = undefined;
PianoRoll.startTime = undefined;
PianoRoll.canv = undefined;
PianoRoll.lineDiff = 32;
PianoRoll.toneOffset = NoteHandler._baseOffset;
PianoRoll.frameOffset = 50;
PianoRoll.timeScaler = undefined;
PianoRoll.translate = false;
PianoRoll.voiceStarted = false;
PianoRoll.voiceStopped = false;