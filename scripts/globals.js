var Globals = {
	microphone: undefined, // Mozilla hack
	render: true,
	fftAn: undefined,
	data: undefined
};

var Keys = {
	D: keyCode('D')
};

// Constants:
var SAMPLE_SIZE = 4096; // MUST be power of 2
var SAMPLE_RATE = 44100; // Not actually changeable :(
var TWO_PI = 2*Math.PI; // DO NOT CHANGE

var G = Globals;