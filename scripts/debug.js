var Debug = new Mode({
	element: "debug",

	firstInit: function(mic, oscNode, gainNode, proc, analyNode){
		//Turn gain input into slider
		$('#gain').slider({
			formater: function(value) {
				return Number(value);
			}
		});

		// Make the render button in debug work.
		$('#Render').bind("click", function(evt) {
			G.render = !G.render;
			//console.log(g_render);
		});

		oscNode.loop=true;
		oscNode.start(0);

		gainNode.gain.value = 1;
		$('#gain-slider').bind("slide",function(evt){
			gainNode.gain.value = Math.pow(2, $('#gain').slider('getValue'));
			//console.log(gain.gain.value);
		});

		// Get some variables ready for the waveform-canvas
		var wf = initCanvas('render-waveform');
		this.wf = wf;
		wf.l = SAMPLE_SIZE; // Number of x-coords in graph of data (The waveform)
		wf.diff = wf.w/wf.l; // Difference in adjacent x-coords in graph of data,
		                     // to avoid redundant calculations, changes seldom.

		// Get some variables ready for fft-canvas
		var fft = initCanvas('render-fft');
		this.fft = fft;
		fft.l = wf.l/2;
		fft.diff = fft.w/(G.fftMax - G.fftMin+1); // Same as wf.diff

		var pit = initCanvas('render-pitch');
		this.pit = pit;


		$("#fftSpan").slider({max:fft.l-1, value: [G.fftMin,G.fftMax] });
		$("#span-slider").bind('slide',function(evt){
			var value = $('#fftSpan').slider('getValue');
			G.fftMin = value[0];
			G.fftMax = value[1];
			fft.diff = fft.w/(G.fftMax - G.fftMin+1);
		});

		// Activate Osc./Mic. button
		$("#Oscillator").bind("click", function(evt){
			if(this.active){
				oscNode.disconnect();
				G.microphone.connect(gainNode);
				this.active = false;
			} else {
				G.microphone.disconnect();
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
				analyNode.connect(G.context.destination);
				//processor.connect(context.destination);
				this.active=true;
			}
		});
	},

	render: function(){
		this.renderWaveform();
		this.renderFFTandPitch();
	},

	// Resizes all canvases and updates diff
	resizeCanvases: function(){
		var wf = this.wf;
		var fft = this.fft;
		var pit = this.pit;
		//alert("resized!");
		adjustCanvas(pit.canvas);
		adjustCanvas(fft.canvas);
		adjustCanvas(wf.canvas);
		wf.w = wf.canvas.width;
		wf.h = wf.canvas.height;
		fft.w = fft.canvas.width;
		fft.h = fft.canvas.height;
		pit.w = pit.canvas.width;
		pit.h = pit.canvas.height;
		fft.diff = fft.w/(G.fftMax - G.fftMin+1);
		wf.diff = wf.w/wf.l;
	}
});


// Canvases:
Debug.pit = undefined;
Debug.wf = undefined;
Debug.fft = undefined;


Debug.renderWaveform = function(){
	var wf = this.wf;

	wf.ctx.clearRect(0,0,wf.w,wf.h);
	wf.ctx.beginPath()
	wf.ctx.moveTo(0,(G.data[0]+1)*wf.h/2)
	for(var j = 0; j < wf.l; j++){
		wf.ctx.lineTo(j*wf.diff,(G.data[j]+1)*wf.h/2);
	}
	wf.ctx.stroke();
	// Render maxDiff text
	wf.ctx.font="10px Georgia";
	wf.ctx.fillText("maxDiff =" + maxDiff(G.data,wf.l),10,10);
}

Debug.renderFFTandPitch = function(){//(analyser, fftAn){
	var fft = this.fft;
	var pit = this.pit;

	var FFTSpec = G.fftAn.spectrum;

	this.renderFFT(FFTSpec, fft, G.top, fft.diff);

	// render pitch
	pit.ctx.clearRect(0,0,pit.w,pit.h);
	pit.ctx.font="50px Georgia";
	pit.ctx.textAlign="center";

	var note = G.note;

	pit.ctx.fillText(G.freq + "Hz",pit.w/2,55);
	pit.ctx.fillText(note.getNoteName(),pit.w/2,pit.h/2+20);
	pit.ctx.fillText(note.getCents() + "c",pit.w/2, pit.h - 15);

}

Debug.renderFFT = function(spectrum, canvasContainer, top, diff){
	var fft = this.fft;
	diff = diff || canvasContainer.w/(G.fftMax - G.fftMin+1);
	canvasContainer.ctx.clearRect(0,0,canvasContainer.w,canvasContainer.h);
	canvasContainer.ctx.font="10px Georgia";
	canvasContainer.ctx.textAlign="center";
	canvasContainer.ctx.beginPath();
	for(var i = Math.max(G.fftMin,0); i <= G.fftMax && i < canvasContainer.l; i++){
		h = spectrum[i];
		canvasContainer.ctx.rect((i-G.fftMin)*fft.diff, canvasContainer.h/2*(1-h) ,fft.diff, h*canvasContainer.h/2);
		if(i%10===0){
			canvasContainer.ctx.fillText(i, (i-G.fftMin)*fft.diff, canvasContainer.h/2 + 20)
		}
	}
	canvasContainer.ctx.fill();

	canvasContainer.ctx.font="10px Georgia";
	canvasContainer.ctx.fillText("FFT",100,10);

	canvasContainer.ctx.beginPath();
	canvasContainer.ctx.strokeStyle = '#ff0000';
	canvasContainer.ctx.moveTo((top-G.fftMin+0.5)*canvasContainer.diff,canvasContainer.h);
	canvasContainer.ctx.lineTo((top-G.fftMin+0.5)*canvasContainer.diff,0);
	canvasContainer.ctx.stroke();
}