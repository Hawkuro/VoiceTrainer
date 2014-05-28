function hasGetUserMedia() {
  	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var keepMe;
var analyser;
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

		//Get some variable ready for the canvas
		var wfCanvas = $('#render-waveform')[0];
		var wfCtx = wfCanvas.getContext('2d');
  		wfCanvas.width  = wfCanvas.offsetWidth;
  		wfCanvas.height = wfCanvas.offsetHeight;
		var w = wfCanvas.width;
		var h = wfCanvas.height;
		var diff = w/analyser.fftSize;

		function frameLooper(){
			window.requestAnimationFrame(frameLooper);
			var l = analyser.fftSize;
			fftArray = new Uint8Array(l);
			analyser.getByteTimeDomainData(fftArray);
			wfCtx.clearRect(0,0,w,h);
			wfCtx.beginPath()
			wfCtx.moveTo(0,fftArray[0])
			for(var i = 0; i < l; i++){
				wfCtx.lineTo(i*diff,fftArray[i]);
			}
			//wfCtx.closePath();
			wfCtx.stroke();

			wfCtx.font="10px Georgia";
			wfCtx.fillText("maxDiff =" + maxDiff(fftArray,l),10,10);
		}

		frameLooper();
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