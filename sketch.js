var _nBucketCount = 4;
var fftBands = 64;

var timeBetween = 1;
var count = 30;

var nPrevTime = -1 * timeBetween;

let mic;

var fft;
var fftSectionWidth;

function setup() {
	createCanvas(600, 800);
	colorMode(HSB);

	mic = new p5.AudioIn();
	mic.start();

	setupfft();
}

function draw() {
	background(0);
	drawfft();
}

function setupfft()
{
	fft = new p5.FFT(0.3, fftBands);
	fft.setInput(mic);
	fftSectionWidth = width / fftBands;
}

function drawfft()
{
	var spectrum = fft.analyze();

	stroke(255);
	for (var i = 0; i < spectrum.length; ++i)
	{
		var amp = spectrum[i];
		var y = map(amp, 0, 255, 200, 0);
		fill(i, 255, 255);
		rect(i * fftSectionWidth, y, fftSectionWidth, 200 - y);
	}

	stroke(255);
	noFill();


	var nTime = millis();
	if (nTime > nPrevTime + timeBetween || nPrevTime === -1)
	{
		nPrevTime = nTime;
		// calcAverages(spectrum);
	}
}

// function calcAverages(aSpectrum)
// {
// 	var total = 0;
// 	for (var i = 0; i < aSpectrum.length; ++i)
// 	{
// 		total += aSpectrum[i];
// 	}

// 	var nAverage = total / _nBucketCount;
// 	if (total < 500)
// 	{
// 		return;	
// 	}

// 	var nBucketTotal = 0;
// 	var aBucketSizes = [];
// 	var aBucketIndexes = [];

// 	var nBucketIndex = 0;
// 	var nSpectrumIndex = 0;
// 	while (nSpectrumIndex < aSpectrum.length && nBucketIndex < _nBucketCount-1)
// 	{
// 		nBucketTotal += aSpectrum[nSpectrumIndex];
// 		if (nSpectrumIndex === aSpectrum.length - 1 || nBucketTotal + aSpectrum[nSpectrumIndex+1] > nAverage)
// 		{
// 			aBucketIndexes[nBucketIndex] = nSpectrumIndex;
// 			if (nBucketIndex > 0)
// 			{
// 				aBucketSizes[nBucketIndex] = nSpectrumIndex - aBucketIndexes[nBucketIndex-1];
// 			}
// 			else
// 			{
// 				aBucketSizes[nBucketIndex] = nSpectrumIndex + 1;
// 			}

// 			nBucketTotal = 0;
// 			nBucketIndex++;
// 		}

// 		++nSpectrumIndex;
// 	}
	
// 	aBucketIndexes[nBucketIndex] = aSpectrum.length - 1;
// 	aBucketSizes[nBucketIndex] = aBucketIndexes[nBucketIndex] - aBucketIndexes[nBucketIndex-1];

// 	console.log(aBucketSizes);
// }
