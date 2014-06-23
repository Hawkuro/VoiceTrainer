// Constants:
var SAMPLE_SIZE = 4096; // MUST be power of 2
var SAMPLE_RATE = 44100; // Not actually changeable :(
var TWO_PI = 2*Math.PI; // DO NOT CHANGE

var Globals = {
	microphone: undefined, // Mozilla hack
	render: true,
	fftAn: undefined,
	data: undefined,
	note: undefined,
	top: undefined,
	freq: undefined,
	fftMin: 1,
	fftMax: SAMPLE_SIZE/32,

	update: function(data){
		G.data = data;
		G.fftAn.forward(G.data);
		this.top = findTop(this.fftMin, this.fftMax);
		this.freq = (this.top*SAMPLE_RATE/SAMPLE_SIZE).toFixed(2);
		this.note = NoteHandler.getFromFreq(this.freq);
	},

};

var Keys = {
	D: keyCode('D')
};

var G = Globals;