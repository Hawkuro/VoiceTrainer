function hasGetUserMedia() {
  	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var keepMe;
var analyser;
var fft;
var pit;
var wf;
var SAMPLE_SIZE = 4096; // MUST be power of 2
var SAMPLE_RATE = 44100;

window.onload = function() {
	//Turn gain input into slider
	$('#gain').slider({
		formater: function(value) {
			return Number(value);
		}
	});

	if (hasGetUserMedia()) {
	  	// Good to go!
	  	//alert('Good to go!');
	  	//$('h1').append("Aww yiss");
		navigator.getUserMedia  = navigator.getUserMedia ||
		                          navigator.webkitGetUserMedia ||
		                          navigator.mozGetUserMedia ||
		                          navigator.msGetUserMedia; //May cause bugs
	} else {
	  	alert('getUserMedia() is not supported in your browser');
	  	//$('h1').append('Aww Shite');
	  	return;
	}

	//var audioElement = $('#replay');

	window.AudioContext = window.AudioContext ||
                      window.webkitAudioContext;
    if(window.AudioContext) {
    	//Good to go
    } else {
    	alert('browser does not support AudioContext');
    	return;
    }

    var context = new AudioContext();

	function processStream(stream){

    	var osc = new Oscillator(DSP.SINE, 440, 1, 176400, SAMPLE_RATE);
    	osc.generate();
    	var signal = osc.signal;
    	var oscBuff = context.createBuffer(1,176400,SAMPLE_RATE);
    	oscBuff.getChannelData(0).set(signal);
    	var oscNode = context.createBufferSource();
    	oscNode.buffer = oscBuff;
    	//oscNode.noteOn(0);
    	oscNode.loop=true;
    	oscNode.start(0);

		var microphone = context.createMediaStreamSource(stream);
		keepMe = microphone; // Disgusting Mozilla hack. It appears to throw the variable out if it's not global.
		/*var filter = context.createBiquadFilter();
		microphone.connect(filter);
		filter*/ //microphone.connect(context.destination);


		/*analyser = context.createAnalyser();
		if(!analyser){
			alert('Browser does not support AnalyserNode, an imperative tool for this application.');
			return;
		}
		analyser.fftSize=2048;*/

		var gain = context.createGain();
		gain.gain.value = 1;
		$('#gain-slider').bind("slide",function(evt){
			gain.gain.value = Math.pow(2, $('#gain').slider('getValue'));
			//console.log(gain.gain.value);
		});



		//For debugging
		/*console.log(microphone);
		console.log(analyser);
		var fbc_array= new Uint8Array(analyser.fftSize); //Not actualy used as an FCB array anymore, but oh well
		analyser.getByteTimeDomainData(fbc_array);
		console.log(fbc_array);*/

		//Get some variable ready for the waveform-canvas
		wf = initCanvas('render-waveform');

		wf.l = SAMPLE_SIZE;//analyser.fftSize;
		//wf.array = new Uint8Array(wf.l);
		wf.diff = wf.w/wf.l;

		fft = initCanvas('render-fft');

		fft.l = wf.l/2;//analyser.frequencyBinCount;
		fft.min = 1;
		fft.max = 100;
		fft.diff = fft.w/(fft.max - fft.min);
		//fft.array = new Float32Array(fft.l);
		//analyser.getFloatFrequencyData(fft.array);
		//console.log(fft.array);

		$("#fftSpan").slider({max:fft.l-1});
		$("#span-slider").bind('slide',function(evt){
			var value = $('#fftSpan').slider('getValue');
			fft.min = value[0];
			fft.max = value[1];
			fft.diff = fft.w/(fft.max - fft.min+1);
		})

		pit = initCanvas('render-pitch');

		//var silence = -100; //This is the FFT output for complete silence, built-in.

		var fftAn = new FFT(SAMPLE_SIZE,44100);

		var processor = context.createScriptProcessor(SAMPLE_SIZE,1,1);
		processor.onaudioprocess = function(evt){
			var buff = evt.inputBuffer;
			var data = buff.getChannelData(0);
			evt.outputBuffer.getChannelData(0).set(data);
			window.requestAnimationFrame(function() {
				wf.array = buff;
				renderWaveform(data);
				renderFFT(data,fftAn);
			});
		}
		//Connect audio modules up
		microphone.connect(gain);
		gain.connect(processor);
		//gain.connect(analyser);

		$("#Oscillator").bind("click", function(evt){
			if(this.active){
				oscNode.disconnect();
				microphone.connect(gain);
				this.active = false;
			} else {
				microphone.disconnect();
				oscNode.connect(gain);
				this.active = true;
			}
		})
		//analyser.connect(context.destination); // Leave mic to speaker playback off by default
		$("#Feedback").bind("click",function(){
			if(this.active){
				//analyser.disconnect();
				processor.disconnect();
				this.active=false;
			} else {
				//analyser.connect(context.destination);
				processor.connect(context.destination);
				this.active=true;
			}
		})

		/*!!function frameLooper(){
			window.requestAnimationFrame(frameLooper);

			//-----------------
			// Render waveform
			//-----------------

			renderWaveform(analyser);

			//------------
			// Render FFT
			//------------

			/*analyser.getFloatFrequencyData(fft.array);
			fft.ctx.clearRect(0,0,fft.w,fft.h);
			var h;
			// Yup, we're doing this with the GPU
			fft.ctx.beginPath();
			for(var i = Math.max(fft.min,0); i <= fft.max && i < fft.l; i++){
				h = fft.array[i];
				fft.ctx.rect((i-fft.min)*fft.diff, fft.h/2 - (h - silence) ,fft.diff, h-silence);
			}*/
			/*fft.ctx.rect(10,10,10,10);
			fft.ctx.rect(30,15,10,10);*/
			/*fft.ctx.fill();*/

			/*!!renderFFT(analyser, fftAn);

			//------------
			// Render DFT
			//------------

			/*pit.ctx.clearRect(0,0,pit.w,pit.h);
			dftAn.forward(wf.array);
			var DFTSpec = fftAn.spectrum;
			pit.ctx.beginPath();
			for(var i = Math.max(fft.min,0); i <= fft.max && i < fft.l; i++){
				h = DFTSpec[i];
				pit.ctx.rect((i-fft.min)*fft.diff, pit.h/2 - (h) ,fft.diff, h);
			}
			pit.ctx.fill();

			pit.ctx.font="10px Georgia";
			pit.ctx.fillText("DFT",100,10);*/

			//--------------
			// Render Pitch
			//--------------

		/*!!}

		frameLooper();*/
	}

	function renderWaveform(data){//(analyser ){
			//analyser.getByteTimeDomainData(wf.array);

			wf.ctx.clearRect(0,0,wf.w,wf.h);
			wf.ctx.beginPath()
			wf.ctx.moveTo(0,(data[0]+1)*wf.h/2)
			for(var j = 0; j < wf.l; j++){
				wf.ctx.lineTo(j*wf.diff,(data[j]+1)*wf.h/2);
			}
			//wfCtx.closePath();
			wf.ctx.stroke();
			// Render maxDiff text
			wf.ctx.font="10px Georgia";
			wf.ctx.fillText("maxDiff =" + maxDiff(data,wf.l),10,10);
	}

	function renderFFT(data, fftAn){//(analyser, fftAn){

			fft.ctx.clearRect(0,0,fft.w,fft.h);
			fftAn.forward(data);
			var FFTSpec = fftAn.spectrum;
			fft.ctx.beginPath();
			for(var i = Math.max(fft.min,0); i <= fft.max && i < fft.l; i++){
				h = FFTSpec[i];
				fft.ctx.rect((i-fft.min)*fft.diff, fft.h/2*(1-h) ,fft.diff, h*fft.h/2);
			}
			fft.ctx.fill();

			fft.ctx.font="10px Georgia";
			fft.ctx.fillText("FFT",100,10);

			var top = findTop(FFTSpec, fft.min, fft.max);
			fft.ctx.beginPath();
			fft.ctx.moveTo((top-fft.min+0.5)*fft.diff,fft.h);
			fft.ctx.lineTo((top-fft.min+0.5)*fft.diff,0);
			fft.ctx.stroke();

			// render pitch
			pit.ctx.clearRect(0,0,pit.w,pit.h);
			pit.ctx.font="100px Georgia";
			pit.ctx.textAlign="center";
			pit.ctx.fillText((top*SAMPLE_RATE/SAMPLE_SIZE).toFixed(2),pit.w/2,pit.h/2+50);

	}

	function findTop(typedArray, min, max){
		var maxInd = min;
		var maxVal = Number.MIN_VALUE;
		for(var i = Math.max(0,min); i <= max && i < typedArray.length; i++){
			if(typedArray[i] <= maxVal){
			} else {
				maxVal = typedArray[i];
				maxInd = i;
			}
		}

		return findFreqIndex(typedArray, maxInd);
	}

	function findFreqIndex(typedArray, index){
		var x = index;
		var y1 = typedArray[x-1];
		var y2 = typedArray[x];
		var y3 = typedArray[x+1];

		return x + (y1-y3)/(2*(y3+y1-2*y2));
		// Assuming the x-es are sequantial, this is -b/2a where the 2nd degree parabola
		// that intersects with the three points ((x,typedArray[x]) and it's left and right neighbours)
		// is ax^2 + bx + c
	}

	function adjustCanvas(canvas)
	{
		canvas.width  = canvas.offsetWidth;
  		canvas.height = canvas.offsetHeight;
	}

	function initCanvas(canvasName)
	{
		var canvas = $('#' + canvasName)[0];
		var ctx = canvas.getContext('2d');
		adjustCanvas(canvas);
		return {
			canvas: canvas,
			ctx: ctx,
			w: canvas.width,
			h: canvas.height
		};
	}

	function maxDiff(array,len)
	{
		var max = 0;
		for(var i = 0; i < len; i++){
			if(Math.abs(array[i]) > max){
				max = Math.abs(array[i]);
			}
		}
		return max;
	}

    navigator.getUserMedia({audio:true}, processStream, function(err){console.log(err);});
}