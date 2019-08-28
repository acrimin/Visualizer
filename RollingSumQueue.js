function TimedSumDataPoint(nValue,nStartTime)
{
	var nStartTime = nStartTime;
	var nEndTime = nStartTime;
	var nDataPoints = 1;

	var nData = nValue;

	this.addValue = function(nValue, nTime)
	{
		nData += nValue;

		nDataPoints++;
		nEndTime = nTime;
	}

	this.getValue = function()
	{
		return nData;
	}

	this.getPoints = function()
	{
		return nDataPoints;
	}

	this.getElapsedTime = function()
	{
		return nEndTime - nStartTime;
	}

	this.getStartTime = function()
	{
		return nStartTime;
	}

	this.getEndTime = function()
	{
		return nEndTime;
	}
};

function RollingAverageQueue(nTrackTime, nDataPoints, opt_bCalcAverageType)
{
	this.calcAverageType = opt_bCalcAverageType === true;

	this._nAverage = 0;
	this._nAverageUpToDate = false;

	this._nTrackTime = nTrackTime;
	this._nMaxDataPoints = nDataPoints;
	this._nTimePerPoint = nTrackTime / nDataPoints;

	this._objCurrentDataPoint = null;
	this._aData = [];

	this._nSum = 0;
	this._nTotalPoints = 0;
};

RollingAverageQueue.prototype.update = function(nValue, nTime)
{
	this._nAverageUpToDate = false;

	this._nSum += nValue;
	this._nTotalPoints++;
	
	if (this._aData.length === 0)
	{
		this._objCurrentDataPoint = new TimedSumDataPoint(nValue, nTime);
		this._aData.push(this._objCurrentDataPoint);
	}
	else if ((nTime - this._objCurrentDataPoint.getStartTime()) > this._nTimePerPoint)
	{
		if (this._aData.length > this._nMaxDataPoints)
		{
			var objRemoved = this._aData.shift();
			this._nSum -= objRemoved.getValue();
			this._nTotalPoints -= objRemoved.getPoints();
		}

		this._objCurrentDataPoint = new TimedSumDataPoint(nValue, nTime);
		this._aData.push(this._objCurrentDataPoint);
	}
	else
	{
		this._objCurrentDataPoint.addValue(nValue, nTime);
	}
}

RollingAverageQueue.prototype.getSum = function()
{
	return this._nSum;
}

RollingAverageQueue.prototype.getPoints = function()
{
	return this._nTotalPoints;
}

RollingAverageQueue.prototype.getTime = function()
{
	return this._aData[this._aData.length-1].getEndTime() - this._aData[0].getStartTime();
}

RollingAverageQueue.prototype.getAverage = function()
{
	if (this._nAverageUpToDate)
	{
		return this._nAverage;			
	}
	else
	{
		this._nAverage = this.calculateAverage();
		this._nAverageUpToDate = true;
		return this._nAverage;
	}
}

// Custom "overridden" function
RollingAverageQueue.prototype.calculateAverage = function()
{
	if (this.calcAverageType)
	{
		return this._nSum / this.getPoints();
	}
	else
	{
		return this._nSum / this.getTime();
	}
}


function RollingPointAverage(nTrackTime, nDataPoints)
{
	RollingAverageQueue.call(this,nTrackTime,nDataPoints,true);
};

RollingPointAverage.prototype = Object.create(RollingAverageQueue.prototype);


function RollingTimeAverage(nTrackTime, nDataPoints)
{
	RollingAverageQueue.call(this,nTrackTime,nDataPoints,false);
};

RollingTimeAverage.prototype = Object.create(RollingAverageQueue.prototype);