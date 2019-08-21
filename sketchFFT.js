var song;
var fft;
var button;

var fftHistory = [];

var bands = 32;
var w;

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
	createCanvas(400, 400);
	colorMode(HSB);

	button = createButton("toggle");
	button.mousePressed(toggleSong);


	fft = new p5.FFT(0.3, bands);
	w = width / bands;
}

function draw() {
	background(0);
	var spectrum = fft.analyze();
	console.log(spectrum);

	stroke(255);
	for (var i = spectrum.length-1; i >= 0; --i)
	{
		var amp = spectrum[i];
		var y = map(amp, 0, 255, height, 0);
		fill(i, 255, 255);
		rect(i * w, y, w, height - y);
	}

	stroke(255);
	noFill();
}