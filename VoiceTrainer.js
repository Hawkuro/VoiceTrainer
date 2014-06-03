function hasGetUserMedia() {
  	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var keepMe;
var analyser;
var wfArray;
var fftArray;
var fft;
var pit;
var wf;

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

    	var osc = new Oscillator(DSP.SINE, 440, 1, 176400, 44100);
    	osc.generate();
    	var signal = osc.signal;
    	var oscBuff = context.createBuffer(1,176400,44100);
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


		analyser = context.createAnalyser();
		if(!analyser){
			alert('Browser does not support AnalyserNode, an imperative tool for this application.');
			return;
		}
		analyser.fftSize=2048;

		var gain = context.createGain();
		gain.gain.value = 1;
		$('#gain-slider').bind("slide",function(evt){
			gain.gain.value = Math.pow(2, $('#gain').slider('getValue'));
			//console.log(gain.gain.value);
		});

		//Connect audio modules up
		microphone.connect(gain);
		gain.connect(analyser);

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
				analyser.disconnect();
				this.active=false;
			} else {
				analyser.connect(context.destination);
				this.active=true;
			}
		})



		//For debugging
		/*console.log(microphone);
		console.log(analyser);
		var fbc_array= new Uint8Array(analyser.fftSize); //Not actualy used as an FCB array anymore, but oh well
		analyser.getByteTimeDomainData(fbc_array);
		console.log(fbc_array);*/

		//Get some variable ready for the waveform-canvas
		wf = initCanvas('render-waveform');

		var wfL = analyser.fftSize;
		wfArray = new Uint8Array(wfL);
		var wfDiff = wf.w/wfL;

		fft = initCanvas('render-fft');

		var fftL = analyser.frequencyBinCount;
		var fftMin = 1;
		var fftMax = 100;
		var fftDiff = fft.w/(fftMax - fftMin);
		fftArray = new Float32Array(fftL);
		analyser.getFloatFrequencyData(fftArray);
		//console.log(fftArray);

		$("#fftSpan").slider({max:fftL-1});
		$("#span-slider").bind('slide',function(evt){
			var value = $('#fftSpan').slider('getValue');
			fftMin = value[0];
			fftMax = value[1];
			fftDiff = fft.w/(fftMax - fftMin+1);
		})

		pit = initCanvas('render-pitch');

		//var silence = -100; //This is the FFT output for complete silence, built-in.

		var fftAn = new FFT(2048,44100);
		var dftAn = new DFT(2048,44100);

		function frameLooper(){
			window.requestAnimationFrame(frameLooper);

			//-----------------
			// Render waveform
			//-----------------
			analyser.getByteTimeDomainData(wfArray);

			wf.ctx.clearRect(0,0,wf.w,wf.h);
			wf.ctx.beginPath()
			wf.ctx.moveTo(0,wfArray[0])
			for(var j = 0; j < wfL; j++){
				wf.ctx.lineTo(j*wfDiff,wfArray[j]);
			}
			//wfCtx.closePath();
			wf.ctx.stroke();
			// Render maxDiff text
			wf.ctx.font="10px Georgia";
			wf.ctx.fillText("maxDiff =" + maxDiff(wfArray,wfL),10,10);

			//------------
			// Render FFT
			//------------

			/*analyser.getFloatFrequencyData(fftArray);
			fft.ctx.clearRect(0,0,fft.w,fft.h);
			var h;
			// Yup, we're doing this with the GPU
			fft.ctx.beginPath();
			for(var i = Math.max(fftMin,0); i <= fftMax && i < fftL; i++){
				h = fftArray[i];
				fft.ctx.rect((i-fftMin)*fftDiff, fft.h/2 - (h - silence) ,fftDiff, h-silence);
			}*/
			/*fft.ctx.rect(10,10,10,10);
			fft.ctx.rect(30,15,10,10);*/
			/*fft.ctx.fill();*/

			fft.ctx.clearRect(0,0,fft.w,fft.h);
			fftAn.forward(wfArray);
			var FFTSpec = fftAn.spectrum;
			fft.ctx.beginPath();
			for(var i = Math.max(fftMin,0); i <= fftMax && i < fftL; i++){
				h = FFTSpec[i];
				fft.ctx.rect((i-fftMin)*fftDiff, fft.h/2 - (h) ,fftDiff, h);
			}
			fft.ctx.fill();

			fft.ctx.font="10px Georgia";
			fft.ctx.fillText("FFT",100,10);

			var top = findTop(FFTSpec, fftMin, fftMax);
			fft.ctx.beginPath();
			fft.ctx.moveTo((top-fftMin+0.5)*fftDiff,fft.h);
			fft.ctx.lineTo((top-fftMin+0.5)*fftDiff,0);
			fft.ctx.stroke();

			//------------
			// Render DFT
			//------------

			/*pit.ctx.clearRect(0,0,pit.w,pit.h);
			dftAn.forward(wfArray);
			var DFTSpec = fftAn.spectrum;
			pit.ctx.beginPath();
			for(var i = Math.max(fftMin,0); i <= fftMax && i < fftL; i++){
				h = DFTSpec[i];
				pit.ctx.rect((i-fftMin)*fftDiff, pit.h/2 - (h) ,fftDiff, h);
			}
			pit.ctx.fill();

			pit.ctx.font="10px Georgia";
			pit.ctx.fillText("DFT",100,10);*/

			//--------------
			// Render Pitch
			//--------------

			pit.ctx.clearRect(0,0,pit.w,pit.h);
			pit.ctx.font="100px Georgia";
			pit.ctx.textAlign="center";
			pit.ctx.fillText(top.toFixed(2),pit.w/2,pit.h/2+50);
		}

		frameLooper();
	}

	function renderWaveform(analyser){

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
			if(Math.abs(128 - array[i]) > max){
				max = Math.abs(128 - array[i]);
			}
		}
		return max;
	}

    navigator.getUserMedia({audio:true}, processStream, function(err){console.log(err);});
}