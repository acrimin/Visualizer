/*
Thoughts:
	Calculate BPM at several different Multiplier levels
	Subscribe to different bpm levels
	track similarly to volume, length of time to check (huge amounts of data when tracking every single update)
	hash map of different bpms subscribe to multiple?
*/

var objMic;
var objAmp;
var objAverageVolume;

const _nMaxBeatsPerMinute = 300;

const _nThresholdMaxBeatsPerMinute = 180;
const _nThresholdMinBeatsPerMinute = 90;

const _nMaxMillisPerBeat = 60000 / _nMaxBeatsPerMinute;
var nPrevBeatTime = -1 * _nMaxMillisPerBeat;

const _nBPMTrackTime = 10 * 1000;
var _nBeatCount = 0;
var nPrevBPMTime = 0;


const _nBeatAdjustDelta = 0.05;
var _nBeatMultiplierValue = 1.5;

const _nMinLevel = 0.03;

var nCurrentColor = 0;


// Local Song
var song;
var button;

function toggleSong()
{
	console.log("Hit");
	if (song.isPlaying())
	{
		song.pause();
	}
	else
	{
		song.play();
	}
}

function preload() 
{
	song = loadSound("song.mp3");
}

function setup() {
	createCanvas(600, 800);

	objAverageVolume = new VolumeAverager();

	button = createButton("toggle");
	button.mousePressed(toggleSong);

	// objMic = new p5.AudioIn();
	// objMic.start();

	objAmp = new p5.Amplitude();
	// objAmp.setInput(objMic);
}

function draw() {
	background(0);

	var nTime = millis();

	var nVolume = objAmp.getLevel();

	objAverageVolume.Update(nVolume, nTime);

	var bIsLoudEnough = getBeat(nVolume);
	var bIsBeat = false;
	if (bIsLoudEnough && nTime > nPrevBeatTime + _nMaxMillisPerBeat)
	{
		nPrevBeatTime = nTime;
		bIsBeat = true;
	}

	getBPM(bIsBeat);

	// draw Beats
	if (bIsBeat)
	{
		nCurrentColor += 35;
		nCurrentColor %= 360;
	}

	noStroke();
	colorMode(HSB);
	fill(nCurrentColor, 80, 80);
	rect(0, 300, 200, 200);
	colorMode(RGB);

	drawGraphBeats(bIsBeat, mouseIsPressed);
	drawHistory(nVolume);
	drawLevel(nVolume);
}

function getBeat(nVolume)
{
	if (nVolume > objAverageVolume.getAverage() * _nBeatMultiplierValue)
	{
		return true;
	}
	else
	{
		return false;
	}
}

function getBPM(bIsBeat)
{
	_nBeatCount += bIsBeat ? 1 : 0;
	
	var nTime = millis()
	if (nTime > nPrevBPMTime + _nBPMTrackTime)
	{

		var nBPM = _nBeatCount / (nTime - nPrevBPMTime);
		nBPM *= 60000;
		console.log("BPM: " + nBPM);

		_nBeatCount = 0;
		nPrevBPMTime = nTime;

		if (nBPM < _nThresholdMinBeatsPerMinute)
		{
			_nBeatMultiplierValue = max(1, _nBeatMultiplierValue - _nBeatAdjustDelta);
		}
		else if (nBPM > _nThresholdMaxBeatsPerMinute)
		{
			_nBeatMultiplierValue = _nBeatMultiplierValue + _nBeatAdjustDelta;
		}

		console.log("Multiplier: " + _nBeatMultiplierValue);
	}
}

function drawLevel(nVolume)
{
	noStroke();
	fill(0,255,0);

	var value = map(nVolume, 0, 1, 0, width);
	rect(0, 200, value, 20);

	fill(255,0,0);
	var value = map(nVolume, 0, objAverageVolume.getAverage() / 0.5, 0, width);
	rect(0, 230, value, 20);

	fill(0,0,255);
	var value = map(objAverageVolume.getAverage(), 0, 1, 0, width);
	rect(0, 260, value, 20);
}

var mouseHistory = [];
var beatHistory = [];
function drawGraphBeats(beat, mouseBeat)
{
	beatHistory.push(beat);
	mouseHistory.push(mouseBeat);

	var y1 = 0;
	var y2 = 200;
	for (var i = 0; i < beatHistory.length; i++)
	{
		if (mouseHistory[i])
		{
			stroke(255,128,0);
			line(i,y1,i,y2);
		}

		if (beatHistory[i])
		{
			stroke(255,255,50);
			line(i,y1,i,y2);
		}

	}

	if (beatHistory.length > width)
	{
		beatHistory.splice(0, 1);
		mouseHistory.splice(0, 1);
	}
}

var volHistory = [];
function drawHistory(volume)
{
	volHistory.push(volume);
	stroke(0, 255, 0);
	noFill();
	beginShape();
	for (var i = 0; i < volHistory.length; i++)
	{
		var y = map(volHistory[i], 0, 1, 200, 0);
		vertex(i, y);
	}
	endShape();

	stroke(255, 0, 0);
	noFill();
	beginShape();
	for (var i = 0; i < volHistory.length; i++)
	{
		var y = map(volHistory[i], 0, objAverageVolume.getAverage() / 0.5, 200, 0);
		vertex(i, y);
	}
	endShape();

	if (volHistory.length > width)
	{
		volHistory.splice(0, 1);
	}
}


function VolumeAverager()
{
	const _nTrackTime = 30 * 1000;
	const _nDataPoints = 1000;
	const _nDataDeltaTime = _nTrackTime / _nDataPoints;
	const _nMinAverageVolume = 0.03;

	var _aVolumeHistory = [1];
	var _nAverage = 1;
	var _nSumAverage = 1;

	nPrevTime = 0;

	this.Update = function(nVolume, nTime)
	{
		if (nVolume > _nMinAverageVolume && nTime > nPrevTime + _nDataDeltaTime)
		{
			nPrevTime = nTime;
			this.CalcAverage(nVolume);
		}
	}

	this.CalcAverage = function(nVolume)
	{
		_aVolumeHistory.push(nVolume);
		_nSumAverage += nVolume;

		if (_aVolumeHistory.length > _nDataPoints)
		{
			var nRemoved = _aVolumeHistory.shift();
			_nSumAverage -= nRemoved;
		}

		_nAverage = _nSumAverage / _aVolumeHistory.length;
	}

	this.getAverage = function()
	{
		return _nAverage;
	}

	this.Reset = function()
	{
		_aVolumeHistory = [];
		_nAverage = 0;
	}
};