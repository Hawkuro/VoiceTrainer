var microphone;
var wf; // Waveform canvas
var fft; // FFT canvas
var pit; // Pitch canvas
var SAMPLE_SIZE = 4096; // MUST be power of 2
var SAMPLE_RATE = 44100; // Not actually changeable :(
var TWO_PI = 2*Math.PI; // DO NOT CHANGE
var g_render = true;
var fftAn;
var KEY_D = keyCode('D');
var debug = true;


window.onload = function() {
	//Turn gain input into slider
	$('#gain').slider({
		formater: function(value) {
			return Number(value);
		}
	});

	$('#Render').bind("click", function(evt) {
		g_render = !g_render;
		//console.log(g_render);
	});

	compatiCheck();

    var context = new AudioContext();
    SAMPLE_RATE = context.sampleRate;

	function processStream(stream){

		// Create the Oscillator and its node
    	var osc = new Oscillator(DSP.SINE, 440, 1, SAMPLE_RATE*4, SAMPLE_RATE);
    	osc.generate();
    	var signal = osc.signal;
    	var oscBuff = context.createBuffer(1,osc.bufferSize,SAMPLE_RATE);
    	oscBuff.getChannelData(0).set(signal);
    	var oscNode = context.createBufferSource();
    	oscNode.buffer = oscBuff;

    	// Create the gain node
		var gain = context.createGain();

		microphone = context.createMediaStreamSource(stream);

		var analyser = context.createAnalyser();
		analyser.fftSize=SAMPLE_SIZE/2;

		Debug.init(gain, oscNode, analyser);

		//Initialize the Processor node
		var processor = context.createScriptProcessor(SAMPLE_SIZE,1,1) || context.createJavaScriptNode(SAMPLE_SIZE,1,1);
		if(!processor){alert("ScriptProcessorNode not supported");}
		processor.onaudioprocess = function(evt){
			var buff = evt.inputBuffer;
			var data = buff.getChannelData(0);
			evt.outputBuffer.getChannelData(0).set(data);
			window.requestAnimationFrame(function() {
				if(g_render && debug){
					Debug.renderWaveform(data);
					Debug.renderFFTandPitch(data,fftAn);
				} 
			});
		}

		//Connect audio modules up
		microphone.connect(gain);
		gain.connect(processor);
		processor.connect(analyser);
	}

	// Get the party started by fetching the mic. input
    navigator.getUserMedia({audio:true}, processStream, function(err){console.log(err);});
}

window.addEventListener('resize', resizeCanvases, false); // Fix canvases upon resize, see utils.js
window.addEventListener('keyup',function(evt){
	if(evt.keyCode === KEY_D){
		debug = !debug;
		if(debug){
			$('#debug').show();
		} else {
			$('#debug').hide();
		}
	};
});