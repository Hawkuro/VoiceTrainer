window.onload = function() {

	// Is your browser compatible? Probably not.
	compatiCheck();

	// Our new friend the Audio Context. This allows audio processing in pure JS. Wünderbar.
	G.context = new AudioContext();
	SAMPLE_RATE = G.context.sampleRate;

	G.fftAn = new FFT(SAMPLE_SIZE,SAMPLE_RATE); // Make FFT analyser, i.e. an object that uses FFT on
												// wavefrom arrays.

	function processStream(stream){

		// Create the Oscillator and its node
		var osc = new Oscillator(DSP.SINE, 440, 1, SAMPLE_RATE*4, SAMPLE_RATE);
		osc.generate();
		var signal = osc.signal;
		var oscBuff = G.context.createBuffer(1,osc.bufferSize,SAMPLE_RATE);
		oscBuff.getChannelData(0).set(signal);
		var oscNode = G.context.createBufferSource();
		oscNode.buffer = oscBuff;

		// Create the gain node
		var gain = G.context.createGain();

		// Create the microphone node, notice thath it's Global, this is to circumvent a bug in FF :/
		G.microphone = G.context.createMediaStreamSource(stream);

		// Create the analyserNode, not currently in use, but seems to fix some bugs uin Chrome for Android
		// for whatever reason.
		var analyser = G.context.createAnalyser();
		analyser.fftSize=SAMPLE_SIZE/2;

		// Create the processor node
		var processor = G.context.createScriptProcessor(SAMPLE_SIZE,1,1) || G.context.createJavaScriptNode(SAMPLE_SIZE,1,1);

		// Initialize modules
		//Debug.firstInit(gain, oscNode, analyser);
		ModeHandler.init(G.microphone, oscNode, gain, processor, analyser);

		//Initialize the Processor node
		if(!processor){alert("ScriptProcessorNode not supported");}
		processor.onaudioprocess = function(evt){
			var buff = evt.inputBuffer;
			var data = buff.getChannelData(0);
			evt.outputBuffer.getChannelData(0).set(data);
			window.requestAnimationFrame(function() {
				G.update(data);
				ModeHandler.update();
				if(G.render){
					ModeHandler.render();
				} 
			});
		}
		window.addEventListener('resize', ModeHandler.resizeCanvases, false); // Fix canvases upon resize, see utils.js


		//Connect audio modules up
		G.microphone.connect(gain);
		gain.connect(processor);
		processor.connect(analyser);
	}

	// Get the party started by fetching the mic. input
	navigator.getUserMedia({audio:true}, processStream, function(err){console.log(err);});
}

window.addEventListener('keyup',function(evt){
	if(evt.keyCode === Keys.D){
		ModeHandler.toggle("debug");
	};
});