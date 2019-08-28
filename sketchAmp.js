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
var objAverageBeats;

const _nMaxBeatsPerMinute = 300;

const _nThresholdMaxBeatsPerMinute = 180;
const _nThresholdMinBeatsPerMinute = 90;

const _nMaxMillisPerBeat = 60000 / _nMaxBeatsPerMinute;
var nPrevBeatTime = -1 * _nMaxMillisPerBeat;

const _nBPMTrackTime = 10 * 1000;
var nPrevBPMTime = 0;

const _nBeatAdjustDelta = 0.05;
var _nBeatMultiplierValue = 1.5;

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

	objAverageVolume = new RollingPointAverage(60000,100);
	objAverageBeats = new RollingTimeAverage(20000,100);

	button = createButton("toggle");
	button.mousePressed(toggleSong);

	// objMic = new p5.AudioIn();
	// objMic.start();

	objAmp = new p5.Amplitude();
	objAmp.setInput();
}

function draw() {
	background(0);

	var nTime = millis();

	var nVolume = objAmp.getLevel();

	if (nVolume > 0.03)
	{
		objAverageVolume.update(nVolume,nTime);
	}

	var bIsLoudEnough = getBeat(nVolume);
	var bIsBeat = false;
	if (bIsLoudEnough && nTime > nPrevBeatTime + _nMaxMillisPerBeat)
	{
		nPrevBeatTime = nTime;
		bIsBeat = true;
	}

	getBPM(bIsBeat);
	objAverageBeats.update(bIsBeat ? 1 : 0, nTime);
	
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

	drawGraphBeats(bIsBeat);
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
	
	var nTime = millis()
	if (nTime > nPrevBPMTime + _nBPMTrackTime)
	{

		var nBPM = objAverageBeats.getAverage();
		nBPM *= 60000;
		console.log("BPM: " + nBPM);

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

var beatHistory = [];
function drawGraphBeats(beat)
{
	beatHistory.push(beat);

	var y1 = 0;
	var y2 = 200;
	for (var i = 0; i < beatHistory.length; i++)
	{
		if (beatHistory[i])
		{
			stroke(255,255,50);
			line(i,y1,i,y2);
		}

	}

	if (beatHistory.length > width)
	{
		beatHistory.splice(0, 1);
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

	stroke(255,255,50);
	var y = map(objAverageVolume.getAverage(), 0, 1, 200, 0);
	line(0,y,width,y);
}