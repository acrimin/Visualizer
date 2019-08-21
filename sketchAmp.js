var song;
var amp;
var button;

var volHistory = [];

function toggleSong()
{
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
	createCanvas(200, 200);
	button = createButton("toggle");
	button.mousePressed(toggleSong);
	amp = new p5.Amplitude();
}

function draw() {
	background(0);
	var vol = amp.getLevel();

	volHistory.push(vol);
	stroke(255);
	noFill();
	beginShape();
	for (var i = 0; i < volHistory.length; i++)
	{
		var y = map(volHistory[i], 0, 1, height, 0);
		vertex(i, y);
	}
	endShape();

	if (volHistory.length > width)
	{
		volHistory.splice(0, 1);
	}
}