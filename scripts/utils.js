//--------------
// System utils
//--------------

// Returns true if the browser supports GetUserMedia, otherwise false
function hasGetUserMedia() {
  	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
	          navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

// Checks if browser is compatible and renames necessary components
function compatiCheck() {
	if (hasGetUserMedia()) {
		navigator.getUserMedia  = navigator.getUserMedia ||
		                          navigator.webkitGetUserMedia ||
		                          navigator.mozGetUserMedia ||
		                          navigator.msGetUserMedia; //May cause bugs
	} else {
	  	alert('getUserMedia() is not supported in your browser');
	  	return;
	}

	window.AudioContext = window.AudioContext ||
	                      window.webkitAudioContext;
	if(window.AudioContext) {
		// Good to go, continue
	} else {
		alert('browser does not support AudioContext');
		return;
	}
}

// A tiny little convenience function
function keyCode(keyChar) {
	return keyChar.charCodeAt(0);
}

function getSelector(item){
	var element = item.element || item;
	return $("#" + element);
}

function emptyFunc(){}

//------------
// Tone utils
//------------

function findTop(min, max){
	var spectrum = G.fftAn.spectrum;
	var maxInd = -1;
	var maxVal = Number.MIN_VALUE;
	for(var i = Math.max(0,min); i <= max && i < spectrum.length; i++){
		if(spectrum[i] <= maxVal){
		} else {
			maxVal = spectrum[i];
			maxInd = i;
		}
	}

	return findFreqIndex(maxInd);
}

function findTops(min, max){
	var spectrum = G.fftAn.spectrum;
	var maxInds = new Float32Array(NUM_TOPS);
	var maxVals = new Array(NUM_TOPS);
	for(var i = 0; i < NUM_TOPS; i++){
		maxInds[i] = -1;
		maxVals[i] = Number.MIN_VALUE;
	}
	for(var i = Math.max(0,min); i <= max && i < spectrum.length; i++){
		if(spectrum[i-1] > spectrum[i] || spectrum[i+1] > spectrum[i]){
			continue;
		}
		for(var j = 0; j < NUM_TOPS; j++){
			if(maxVals[j] >= spectrum[i]){
				break;
			} else {
				if(j > 0){
					maxVals[j-1] = maxVals[j];
					maxInds[j-1] = maxInds[j];
				}
				maxVals[j] = spectrum[i];
				maxInds[j] = findFreqIndex(i);
			}
		}
	}

	return maxInds;
}

function closestTop(target, tops){
	var targetPitch = target.getNotePitch();
	var minDiff = Number.MAX_VALUE;
	var choice;
	for(var i = 0; i < NUM_TOPS; i++){
		var diff = Math.abs( targetPitch - NoteHandler.getFromFreq(toFreq(tops[i])).getNotePitch() );
		if(diff < minDiff){
			minDiff = diff;
			choice = i;
		}
	}

	return tops[choice];
}

function toFreq(index){
	return index*SAMPLE_RATE/SAMPLE_SIZE;
}

function findFreqIndex(index){

	// Quinn:
	var real = G.fftAn.real;
	//console.log(real.length);
	var imag = G.fftAn.imag;

	// Returns Real( fft[i]/fft[j] ) where fft is a hypothetical array of
	// the complex results from the FFT
	function quinnDivide(i,j){
		return complexDivide(real[i],imag[i],real[j],imag[j])[0];
	}

	var a1 = quinnDivide(index-1,index);
	var a2 = quinnDivide(index+1,index);
	var d1 = a1/(1-a1);
	var d2 = -a2/(1-a2);
	var d;
	if(d1 > 0 && d2 > 0){ // A bit of bit-wise hacking
		d = d2;
	} else {
		d = d1;
	}

	return index + d//TWO_PI*(index - 1+d)/real.length;
}

// If z = (xRe + i*xIm) / (yRe + i*yIm) where i is the imaginary number
// then this returns an array [Real(z),Imag(z)]
function complexDivide(xRe, xIm, yRe, yIm){
	var yLenSq = yRe*yRe + yIm*yIm;
	return [
		(xRe*yRe + xIm*yIm)/yLenSq,
		(xIm*yRe - xRe*yIm)/yLenSq
	];
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

//--------------
// Canvas utils
//--------------

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

function plotLine(ctx, fromX, fromY, toX, toY){
	ctx.moveTo(fromX,fromY);
	ctx.lineTo(toX,toY);
}

//----------------------
// Circular buffer tool 
//----------------------

function circularBuffer(size){
	this.buffer = new Float64Array(size);
	for(var i = 0; i < size; i++){
		this.buffer[i] = NaN;
	}
	this.n = 0;
	this.len = size;
	this.full = false;
}

circularBuffer.prototype.add = function(item){
	this.buffer[this.n] = item;
	this.n = (this.n + 1) % this.len;
	if(this.n){return;} // if n is zero at this point, it's gone full circle and is full
	this.full = true;
}

circularBuffer.prototype.get = function(index){
	var n = !this.full ? 0 : this.n;
	return this.buffer[(n + index + this.len) % this.len];
}