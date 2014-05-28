function hasGetUserMedia() {
  	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var keepMe;
var analyser;
var wfArray = [];
var fftArray;

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
			console.log(gain.gain.value);
		});

		//Connect audio modules up
		microphone.connect(gain);
		gain.connect(analyser);
		//analyser.connect(context.destination);
		var on = false;
		$("#Test").bind("click",function(){
			if(on){
				analyser.disconnect();
				this.active=false;
				on = false;
			} else {
				analyser.connect(context.destination);
				this.active=true;
				on = true;
			}
		})



		//For debugging
		/*console.log(microphone);
		console.log(analyser);
		var fbc_array= new Uint8Array(analyser.fftSize); //Not actualy used as an FCB array anymore, but oh well
		analyser.getByteTimeDomainData(fbc_array);
		console.log(fbc_array);*/

		//Get some variable ready for the waveform-canvas
		var wf = initCanvas('render-waveform');

		var wfL = analyser.fftSize;
		wfArray[0] = new Uint8Array(wfL);
		wfArray[1] = new Uint8Array(wfL);
		var wfDiff = wf.w/(wfL*wfArray.length);

		var fft = initCanvas('render-fft');

		var fftL = analyser.frequencyBinCount;
		var fftMin = 0;
		var fftMax = 100;
		var fftDiff = fft.w/(fftMax - fftMin);
		fftArray = new Float32Array(fftL);

		$("#fftSpan").slider({max:fftL-1});
		$("#span-slider").bind('slide',function(evt){
			var value = $('#fftSpan').slider('getValue');
			fftMin = value[0];
			fftMax = value[1];
			fftDiff = fft.w/(fftMax - fftMin+1);
		})

		var pit = initCanvas('render-pitch');

		function frameLooper(){
			window.requestAnimationFrame(frameLooper);

			//-----------------
			// Render waveform
			//-----------------
			analyser.getByteTimeDomainData(wfArray[0]);
			analyser.getByteTimeDomainData(wfArray[1]);

			wf.ctx.clearRect(0,0,wf.w,wf.h);
			wf.ctx.beginPath()
			wf.ctx.moveTo(0,wfArray[0][0])
			for(var i = 0; i < wfArray.length; i++){
				for(var j = 0; j < wfL; j++){
					wf.ctx.lineTo((i*wfL+j)*wfDiff,wfArray[i][j]);
				}
			}
			//wfCtx.closePath();
			wf.ctx.stroke();
			// Render maxDiff text
			wf.ctx.font="10px Georgia";
			wf.ctx.fillText("maxDiff =" + maxDiff(wfArray,wfL),10,10);

			//------------
			// Render fft
			//------------
			analyser.getFloatFrequencyData(fftArray);
			fft.ctx.clearRect(0,0,fft.w,fft.h);
			var h;
			// Yup, we're doing this with the GPU
			fft.ctx.beginPath();
			for(var i = Math.max(fftMin,0); i <= fftMax && i < fftL; i++){
				h = fftArray[i];
				fft.ctx.rect((i-fftMin)*fftDiff, -h-10 ,fftDiff, fft.h+h);
			}
			/*fft.ctx.rect(10,10,10,10);
			fft.ctx.rect(30,15,10,10);*/
			fft.ctx.fill();
		}

		frameLooper();
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