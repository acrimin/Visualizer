function TimedSumDataPoint(nValue,nStartTime)
{
	var nStartTime = nStartTime;
	var nEndTime = 0;
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

function RollingSumQueue(nTrackTime, nDataPoints)
{
	this._nTrackTime = nTrackTime;
	this._nMaxDataPoints = nDataPoints;
	this._nTimePerPoint = nTrackTime / nDataPoints;

	this._objCurrentDataPoint = null;
	this._aData = [];

	this._nSum = 0;
	this._nTotalPoints = 0;
};

RollingSumQueue.prototype.update = function(nValue, nTime)
{
	this._nSum += nValue;
	this._nTotalPoints++;
	
	if (this._aData.length === 0)
	{
		this._objCurrentDataPoint = new TimedSumDataPoint(nValue, nTime);
		this._aData.push(this._objCurrentDataPoint);
	}
	else if (this._objCurrentDataPoint.getElapsedTime() > this._nTimePerPoint)
	{
		if (this._aData.length > this._nMaxDataPoints)
		{
			this._nSum -= this._objCurrentDataPoint.getValue();
			this._nTotalPoints -= this._objCurrentDataPoint.getPoints();
			this._aData.shift();
		}

		this._objCurrentDataPoint = new TimedSumDataPoint(nValue, nTime);
		this._aData.push(this._objCurrentDataPoint);
	}
	else
	{
		this._objCurrentDataPoint.addValue(nValue, nTime);
	}
}

RollingSumQueue.prototype.getSum = function()
{
	return this._nSum;
}

RollingSumQueue.prototype.getPoints = function()
{
	return this._nTotalPoints;
}

RollingSumQueue.prototype.getTime = function()
{
	return this._aData[this._aData.length-1].getStartTime() - this._aData[0].getEndTime();
}

function RollingAverage(nTrackTime, nDataPoints)
{
	RollingSumQueue.call(this,nTrackTime,nDataPoints);

	var _nAverageUpToDate = true;
	var _nAverage = 1;
	
	this.update = function(nValue, nTime)
	{
		_nAverageUpToDate = false;
		RollingSumQueue.prototype.update.call(this, nValue, nTime);
	}
	
	this.getAverage = function()
	{
		if (_nAverageUpToDate)
		{
			return _nAverage;			
		}
		else
		{
			_nAverage = this._nSum / this._nTotalPoints;
			return _nAverage;
		}
	}
};

RollingAverage.prototype = Object.create(RollingSumQueue.prototype);