// Constants:
var SAMPLE_SIZE = 4096; // MUST be power of 2
var SAMPLE_RATE = 44100; // Not actually changeable :(
var TWO_PI = 2*Math.PI; // DO NOT CHANGE
var NUM_TOPS = 5;
var PIANO_ROLL_START_THRESHHOLD = 0.15;

var Globals = {
	microphone: undefined, // Mozilla hack
	render: true,
	fftAn: undefined,
	data: undefined,
	note: undefined,
	top: undefined,
	tops: undefined,
	target: NoteHandler.getFromNoteName("A",4), // Only PianoRoll may change
	freq: undefined,
	fftMin: 1,
	fftMax: SAMPLE_SIZE/16,

	update: function(data){
		G.data = data;
		G.fftAn.forward(G.data);
		this.tops = findTops(this.fftMin,this.fftMax);
		this.top = closestTop(this.target, this.tops);//findTop(this.fftMin, this.fftMax);
		this.freq = (toFreq(this.top)).toFixed(2);
		this.note = NoteHandler.getFromFreq(this.freq);
	},

};

var Keys = {
	D: keyCode('D')
};

var G = Globals;