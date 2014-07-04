var PianoRoll = new Mode({
	firstInit: function(mic, osc, gain, analy, proc){
		this.canv = initCanvas("render-pianoRoll");
		this.timeScaler = 1/1000*SAMPLE_RATE/SAMPLE_SIZE;
	},

	init: function(){
		//console.log(this.canv.w - this.frameOffset);
		this.frameOffset = Math.floor(this.canv.w*0.6);
		this.pitchBuffer = new circularBuffer(this.frameOffset+100);
		this.timeBuffer = new circularBuffer(this.frameOffset+100);
		this.drawFromRight = false;
		this.startTime = Date.now()*this.timeScaler;
	},

	element: "pianoRoll",

	resizeCanvases: function(){
		adjustCanvas(this.canv.canvas);
		this.canv.h = this.canv.canvas.height;
		this.canv.w = this.canv.canvas.width;
	},

	update: function(){
		this.timeBuffer.add(Date.now()*this.timeScaler);
		this.edgeTime = this.timeBuffer.full ? this.timeBuffer.get(-1) : this.timeBuffer.get(0);
		this.pitchBuffer.add((NoteHandler.getFromFreq(toFreq(G.top)).getNotePitch() - this.toneOffset)*this.lineDiff);
		//console.log(NoteHandler.getFromFreq(toFreq(G.top)).getNotePitch());
		if(!this.drawFromRight && this.timeBuffer.get(-1) - this.startTime >= this.frameOffset){
			this.drawFromRight = true;
		}
	},

	render: function(){
		var ctx = this.canv.ctx;

		ctx.clearRect(0,0,this.canv.w,this.canv.h);
		this.readyCanvas(ctx);

		if(this.drawFromRight){
			this.translateAndDrawBuffer(ctx);
		} else {
			this.drawBufferFromLeft(ctx);
		}
	}
});

PianoRoll.readyCanvas = function(ctx){
	var baseHeight = this.canv.h/2 - 5.5*this.lineDiff;
	ctx.beginPath();
	for(var i = 0; i < 12; i++){
		var h = baseHeight + i*this.lineDiff;
		plotLine(ctx, 0, h, this.canv.w, h);
	}
	ctx.stroke();
};

PianoRoll.drawBufferFromRight = function(ctx){
	ctx.save();
	ctx.strokeStyle = "blue";
	ctx.beginPath();
	ctx.moveTo(this.frameOffset, this.canv.h/2 - this.pitchBuffer.get(-1));
	var xOffset = this.frameOffset - this.startTime;
	var yOffset = this.canv.h/2;
	for(var i = 1; i < this.pitchBuffer.len; i++){
		ctx.lineTo(xOffset + this.timeBuffer.get(-i-1), yOffset - this.pitchBuffer.get(-i-1));
	}
	ctx.stroke();
	ctx.restore();
};

PianoRoll.translateAndDrawBuffer = function(ctx){
	ctx.save();
	ctx.translate(this.startTime + this.frameOffset - this.timeBuffer.get(-1),0);
	this.drawBufferFromLeft(ctx);
	ctx.restore();
};

PianoRoll.drawBufferFromLeft = function(ctx){
	//console.log("here");
	ctx.save();
	ctx.strokeStyle = "blue";
	ctx.beginPath();
	ctx.moveTo(0, this.canv.h/2 - this.pitchBuffer.get(0));
	for(var i = 1; i < this.pitchBuffer.len; i++){	
		if(!isNaN(this.pitchBuffer.get(i))){
			//Do stuff
			ctx.lineTo(this.timeBuffer.get(i) - this.startTime, this.canv.h/2 - this.pitchBuffer.get(i));
			//console.log(i);
			//console.log((this.canv.h - this.buffer.get(i))*this.lineDiff)
			//console.log(this.timeBuffer.get(i));
		} else {
			break;
		}
	}
	ctx.stroke();
	ctx.restore();
};

PianoRoll.pitchBuffer = undefined;
PianoRoll.timeBuffer = undefined;
PianoRoll.edgeTime = undefined;
PianoRoll.canv = undefined;
PianoRoll.lineDiff = 16;
PianoRoll.toneOffset = 57;
PianoRoll.frameOffset = 50;
PianoRoll.timeScaler = undefined;
PianoRoll.drawFromRight = false;