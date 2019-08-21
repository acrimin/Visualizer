var fftBands = 64;

var _nBucketCount = 4;
var timeBetween = 1;
var count = 30;
var _aAverageSizesHolder = [];
var _aAverageSizes = [];

var nPrevTime = -1 * timeBetween;

let mic;

var fft;
var fftSectionWidth;

function setup() {
	createCanvas(600, 800);

	mic = new p5.AudioIn();
	mic.start();

	fft = new p5.FFT(0.3, fftBands);
	fft.setInput(mic);
	fftSectionWidth = width / fftBands;
}

function draw() {
	background(0);
	
	var spectrum = fft.analyze();

	colorMode(HSB);
	stroke(255);
	for (var i = 0; i < spectrum.length; ++i)
	{
		var amp = spectrum[i];
		var y = map(amp, 0, 255, 200, 0);
		fill(i*255/fftBands, 255, 255);
		rect(i * fftSectionWidth, y, fftSectionWidth, 200 - y);
	}

	fill(0,0,255)
	var nStartY = 200;
	rect(0, nStartY, width, 5);

	var nTime = millis();
	if (nTime > nPrevTime + timeBetween || nPrevTime === -1)
	{
		nPrevTime = nTime;
		calcAverages(spectrum);
	}
}

function calcAverages(aSpectrum)
{
	var total = 0;
	for (var i = 0; i < aSpectrum.length; ++i)
	{
		total += aSpectrum[i];
	}

	var nAverage = total / _nBucketCount;
	if (total < 500)
	{
		return [];	
	}

	var nBucketTotal = 0;
	var aBucketSizes = [];
	var aBucketIndexes = [];

	var nBucketIndex = 0;
	var nSpectrumIndex = 0;
	while (nSpectrumIndex < aSpectrum.length && nBucketIndex < _nBucketCount-1)
	{
		nBucketTotal += aSpectrum[nSpectrumIndex];
		if (nSpectrumIndex === aSpectrum.length - 1 || nBucketTotal + aSpectrum[nSpectrumIndex+1] > nAverage)
		{
			aBucketIndexes[nBucketIndex] = nSpectrumIndex;
			if (nBucketIndex > 0)
			{
				aBucketSizes[nBucketIndex] = nSpectrumIndex - aBucketIndexes[nBucketIndex-1];
			}
			else
			{
				aBucketSizes[nBucketIndex] = nSpectrumIndex + 1;
			}

			nBucketTotal = 0;
			nBucketIndex++;
		}

		++nSpectrumIndex;
	}
	
	aBucketIndexes[nBucketIndex] = aSpectrum.length - 1;
	aBucketSizes[nBucketIndex] = aBucketIndexes[nBucketIndex] - aBucketIndexes[nBucketIndex-1];

	updateAverages(aBucketIndexes)
}

function updateAverages(aAverages)
{
	_aAverageSizesHolder.push(aAverages);
	if (_aAverageSizesHolder.length)
	{
		var aRemovedAverage = _aAverageSizesHolder.shift();
	}

	nStartY = 205;

	var nX = 0;
	for (var i = 0; i < aAverages.length; ++i)
	{
		var nX2 = (aAverages[i]+1) * fftSectionWidth;
		fill(i*255/_nBucketCount, 255, 255);
		rect(nX, nStartY, nX2-nX, 20);

		nX = nX2;
	}
}