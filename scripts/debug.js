var Debug = new Mode({
	element: "debug",

	firstInit: function(mic, oscNode, gainNode, proc, analyNode){
		MIDI.loader = new widgets.Loader(false);
		MIDI.loadPlugin(function(){
			MIDI.Player.loadFile(midiData[0], emptyFunc);
			$(".loader").hide();
		});
		//Turn gain input into slider
		$('#gain').slider({
			formater: function(value) {
				return Number(value);
			}
		});

		// Make the render button in debug work.
		$('#Render').bind("click", function(evt) {
			G.render = !this.hasClass("active");
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
			if($(this).hasClass("active")){
				oscNode.disconnect();
				G.microphone.connect(gainNode);
			} else {
				G.microphone.disconnect();
				oscNode.connect(gainNode);
			}
		});

		// Activate Feedback button
		//analyser.connect(context.destination); // Leave mic to speaker playback off by default
		$("#Feedback").bind("click",function(evt){
			//console.log($(this));
			if($(this).hasClass("active")){
				analyNode.disconnect();
				//processor.disconnect();
			} else {
				analyNode.connect(G.context.destination);
				//processor.connect(context.destination);
			}
		});

		// Activate Toggle Voice Line Button
		$("#VoiceLine").bind("click",function(evt){
			if(PianoRoll.voiceStarted){
				PianoRoll.stopVoice();
			} else {
				PianoRoll.startVoice();
			}
		})
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
	},

	update: function(){
		PianoRoll.voiceStarted ? $("#VoiceLine").addClass("active") : $("#VoiceLine").removeClass("active");
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

	this.renderFFT(FFTSpec, fft, G.top, fft.diff, G.tops);

	// render pitch
	pit.ctx.clearRect(0,0,pit.w,pit.h);
	pit.ctx.font="50px Georgia";
	pit.ctx.textAlign="center";

	var note = G.note;

	pit.ctx.fillText(G.freq + "Hz",pit.w/2,55);
	pit.ctx.fillText(note.getNoteName(),pit.w/2,pit.h/2+20);
	pit.ctx.fillText(note.getCents() + "c",pit.w/2, pit.h - 15);

}

Debug.renderFFT = function(spectrum, canvasContainer, top, diff, tops){
	var fft = this.fft;
	diff = diff || canvasContainer.w/(G.fftMax - G.fftMin+1);
	canvasContainer.ctx.clearRect(0,0,canvasContainer.w,canvasContainer.h);
	canvasContainer.ctx.font="10px Georgia";
	canvasContainer.ctx.textAlign="center";
	canvasContainer.ctx.beginPath();
	var legendLength = Math.floor((G.fftMax - G.fftMin)/10);
	for(var i = Math.max(G.fftMin,0); i <= G.fftMax && i < canvasContainer.l; i++){
		h = spectrum[i];
		canvasContainer.ctx.rect((i-G.fftMin)*fft.diff, canvasContainer.h/2*(1-h) ,fft.diff, h*canvasContainer.h/2);
		if(i%legendLength===0){
			canvasContainer.ctx.fillText(Math.round(toFreq(i)), (i-G.fftMin)*fft.diff, canvasContainer.h/2 + 20)
		}
	}
	canvasContainer.ctx.fill();

	canvasContainer.ctx.font="10px Georgia";
	canvasContainer.ctx.fillText("FFT",100,10);

	function drawTopLine(ind, color){
		canvasContainer.ctx.beginPath();
		canvasContainer.ctx.strokeStyle = color;
		canvasContainer.ctx.moveTo((ind - G.fftMin + 0.5)*canvasContainer.diff, canvasContainer.h);
		canvasContainer.ctx.lineTo((ind - G.fftMin + 0.5)*canvasContainer.diff,0);
		canvasContainer.ctx.stroke();
	}

	for(var i = 0; i < NUM_TOPS; i++){
		drawTopLine(tops[i],"#000000");
	}

	drawTopLine(G.target.getFreq()/SAMPLE_RATE*SAMPLE_SIZE, "#00ff00");

	drawTopLine(top, "#ff0000");
}