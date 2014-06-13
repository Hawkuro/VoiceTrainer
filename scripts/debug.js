var Debug = {
	init: function(gainNode, oscNode, analyNode){
    	oscNode.loop=true;
    	oscNode.start(0);

		gainNode.gain.value = 1;
		$('#gain-slider').bind("slide",function(evt){
			gainNode.gain.value = Math.pow(2, $('#gain').slider('getValue'));
			//console.log(gain.gain.value);
		});

		// Get some variables ready for the waveform-canvas
		wf = initCanvas('render-waveform');
		wf.l = SAMPLE_SIZE; // Number of x-coords in graph of data (The waveform)
		wf.diff = wf.w/wf.l; // Difference in adjacent x-coords in graph of data,
		                     // to avoid redundant calculations, changes seldom.

		// Get some variables ready for fft-canvas
		fft = initCanvas('render-fft');
		fft.l = wf.l/2;
		fft.min = 1;
		fft.max = 100;
		fft.diff = fft.w/(fft.max - fft.min); // Same as wf.diff

		pit = initCanvas('render-pitch');

		$("#fftSpan").slider({max:fft.l-1, value: [1,SAMPLE_SIZE/32] });
		$("#span-slider").bind('slide',function(evt){
			var value = $('#fftSpan').slider('getValue');
			fft.min = value[0];
			fft.max = value[1];
			fft.diff = fft.w/(fft.max - fft.min+1);
		});

		fftAn = new FFT(SAMPLE_SIZE,SAMPLE_RATE); // Make FFT analyser, i.e. an object that uses FFT on
												  // wavefrom arrays.

		// Activate Osc./Mic. button
		$("#Oscillator").bind("click", function(evt){
			if(this.active){
				oscNode.disconnect();
				microphone.connect(gainNode);
				this.active = false;
			} else {
				microphone.disconnect();
				oscNode.connect(gainNode);
				this.active = true;
			}
		});

		// Activate Feedback button
		//analyser.connect(context.destination); // Leave mic to speaker playback off by default
		$("#Feedback").bind("click",function(){
			if(this.active){
				analyNode.disconnect();
				//processor.disconnect();
				this.active=false;
			} else {
				analyNode.connect(context.destination);
				//processor.connect(context.destination);
				this.active=true;
			}
		});
	},

	renderWaveform: function(data){

		wf.ctx.clearRect(0,0,wf.w,wf.h);
		wf.ctx.beginPath()
		wf.ctx.moveTo(0,(data[0]+1)*wf.h/2)
		for(var j = 0; j < wf.l; j++){
			wf.ctx.lineTo(j*wf.diff,(data[j]+1)*wf.h/2);
		}
		wf.ctx.stroke();
		// Render maxDiff text
		wf.ctx.font="10px Georgia";
		wf.ctx.fillText("maxDiff =" + maxDiff(data,wf.l),10,10);
	},

	renderFFTandPitch: function(data, fftAn){//(analyser, fftAn){

		fftAn.forward(data);
		var FFTSpec = fftAn.spectrum;
		var top = findTop(fftAn, fft.min, fft.max);//(FFTSpec, fft.min, fft.max);

		this.renderFFT(FFTSpec, fft, top, fft.diff);

		// render pitch
		pit.ctx.clearRect(0,0,pit.w,pit.h);
		pit.ctx.font="50px Georgia";
		pit.ctx.textAlign="center";

		var freq = (top*SAMPLE_RATE/SAMPLE_SIZE).toFixed(2);
		var note = NoteHandler.getFromFreq(freq);

		pit.ctx.fillText(freq + "Hz",pit.w/2,55);
		pit.ctx.fillText(note.getNoteName(),pit.w/2,pit.h/2+20);
		pit.ctx.fillText(note.getCents() + "c",pit.w/2, pit.h - 15);

	},

	renderFFT: function(spectrum, canvasContainer, top, diff){
		diff = diff || canvasContainer.w/(fft.max - fft.min+1);
		canvasContainer.ctx.clearRect(0,0,canvasContainer.w,canvasContainer.h);
		canvasContainer.ctx.font="10px Georgia";
		canvasContainer.ctx.textAlign="center";
		canvasContainer.ctx.beginPath();
		for(var i = Math.max(fft.min,0); i <= fft.max && i < canvasContainer.l; i++){
			h = spectrum[i];
			canvasContainer.ctx.rect((i-fft.min)*fft.diff, canvasContainer.h/2*(1-h) ,fft.diff, h*canvasContainer.h/2);
			if(i%10===0){
				canvasContainer.ctx.fillText(i, (i-fft.min)*fft.diff, canvasContainer.h/2 + 20)
			}
		}
		canvasContainer.ctx.fill();

		canvasContainer.ctx.font="10px Georgia";
		canvasContainer.ctx.fillText("FFT",100,10);

		canvasContainer.ctx.beginPath();
		canvasContainer.ctx.strokeStyle = '#ff0000';
		canvasContainer.ctx.moveTo((top-canvasContainer.min+0.5)*canvasContainer.diff,canvasContainer.h);
		canvasContainer.ctx.lineTo((top-canvasContainer.min+0.5)*canvasContainer.diff,0);
		canvasContainer.ctx.stroke();

	}
}