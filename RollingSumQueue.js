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
	return this._aData[this._aData.length-1].getEndTime() - this._aData[0].getStartTime();
}


function RollingPointAverage(nTrackTime, nDataPoints)
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
			_nAverage = this._nSum / this.getPoints();
			return _nAverage;
		}
	}
};

RollingPointAverage.prototype = Object.create(RollingSumQueue.prototype);


function RollingTimeAverage(nTrackTime, nDataPoints)
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
			_nAverage = this._nSum / this.getTime();
			return _nAverage;
		}
	}
};

RollingTimeAverage.prototype = Object.create(RollingSumQueue.prototype);