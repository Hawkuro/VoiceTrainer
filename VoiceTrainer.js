function hasGetUserMedia() {
  	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var keepMe;
var analyser;
var fftArray;

window.onload = function() {
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

	var audioElement = $('#replay');

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
		microphone.connect(analyser);
		analyser.connect(context.destination);
		console.log(microphone);
		console.log(analyser);
		var fbc_array= new Uint8Array(analyser.fftSize);
		analyser.getByteTimeDomainData(fbc_array);
		console.log(fbc_array);

		var canvas = $('#render')[0];
		var ctx = canvas.getContext('2d');
  		canvas.width  = canvas.offsetWidth;
  		canvas.height = canvas.offsetHeight;
		var w = canvas.width;
		var h = canvas.height;
		var diff = w/analyser.fftSize;

		function frameLooper(){
			window.requestAnimationFrame(frameLooper);
			var l = analyser.fftSize;
			fftArray = new Uint8Array(l);
			analyser.getByteTimeDomainData(fftArray);
			ctx.clearRect(0,0,w,h);
			ctx.beginPath()
			ctx.moveTo(0,fftArray[0])
			for(var i = 0; i < l; i++){
				ctx.lineTo(i*diff,fftArray[i]);
			}
			//ctx.closePath();
			ctx.stroke();
		}

		frameLooper();
	}

    navigator.getUserMedia({audio:true}, processStream, function(err){console.log(err);});
}