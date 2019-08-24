var objMic;
var objAmp;

const _nMaxBeatsPerMinute = 300;
// const _nMaxBeatsPerMinute = 220;
// const _nMaxBeatsPerMinute = 90;
const _nMaxMillisPerBeat = 60000 / _nMaxBeatsPerMinute;
var nPrevBeatTime = -1 * _nMaxMillisPerBeat;

const _nBPMTrackTime = 10 * 1000;
var _nBeatCount = 0;
var nPrevBPMTime = 0;

const _nMinLevel = 0.03;

const _nLevelThreshold = 0.5;
const _nAverageTrackTime = 60 * 1000;
// const _nAverageTrackResolutionTime = 1000;
const _nAverageTrackResolutionCount = 1000;

var _nAverage = 1;
var _nSumAverage = 1;
var _aAverageLevelsHolder = [1];

// var _nAverageTrackTime = _nAverageTrackResolutionTime * _nAverageTrackResolutionCount;
var _nAverageTrackResolutionTime = _nAverageTrackTime / _nAverageTrackResolutionCount;
// var _nAverageTrackResolutionCount = _nAverageTrackTime / _nAverageTrackResolutionTime;

var nPrevTime = -1 * _nAverageTrackResolutionTime;

function setup() {
	createCanvas(600, 800);

	objMic = new p5.AudioIn();
	objMic.start();

	objAmp = new p5.Amplitude();
	objAmp.setInput(objMic);
}

function draw() {
	background(0);
	var nTime = millis();

	var nVolume = objAmp.getLevel();

	if (nVolume > _nMinLevel)
	{
		stroke(255);
		fill(0,255,0);
		rect(0, 0, 20, 20);

		if (nTime > nPrevTime + _nAverageTrackResolutionTime || nPrevTime === -1)
		{
			nPrevTime = nTime;
			calcAverages(nVolume);
		}
	}
	else
	{
		stroke(255);
		fill(255,0,0);
		rect(0, 0, 20, 20);
	}

	var bIsLoudEnough = getBeat(nVolume);
	var bIsBeat = false;
	if (bIsLoudEnough && nTime > nPrevBeatTime + _nMaxMillisPerBeat)
	{
		nPrevBeatTime = nTime;
		bIsBeat = true;
	}

	getBPM(bIsBeat);

	drawGraphBeats(bIsBeat, mouseIsPressed);
	drawHistory(nVolume);
	drawLevel(nVolume);
}

function getBeat(nVolume)
{
	if (nVolume > _nAverage * 1.5)
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
		console.log(nBPM);

		_nBeatCount = 0;
		nPrevBPMTime = nTime;
	}
}

function drawLevel(nVolume)
{
	noStroke();
	fill(0,255,0);

	var value = map(nVolume, 0, 1, 0, width);
	rect(0, 200, value, 20);

	fill(255,0,0);
	var value = map(nVolume, 0, _nAverage / _nLevelThreshold, 0, width);
	rect(0, 230, value, 20);

	fill(0,0,255);
	var value = map(_nAverage, 0, 1, 0, width);
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
		var y = map(volHistory[i], 0, _nAverage / _nLevelThreshold, 200, 0);
		vertex(i, y);
	}
	endShape();

	if (volHistory.length > width)
	{
		volHistory.splice(0, 1);
	}
}

function calcAverages(nVolume)
{
	_aAverageLevelsHolder.push(nVolume);
	_nSumAverage += nVolume;

	if (_aAverageLevelsHolder.length > _nAverageTrackResolutionCount)
	{
		var nRemoved = _aAverageLevelsHolder.shift();
		_nSumAverage -= nRemoved;
	}

	_nAverage = _nSumAverage / _aAverageLevelsHolder.length;
}