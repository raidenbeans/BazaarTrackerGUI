class Graph {

    constructor(id, dataPointsUnadjusted) {
        this._elementId = id;
        this._data = dataPointsUnadjusted;
        this._jsonData = "";

        this.points = new Array();
        if (document.getElementById(id) === null) {
            this.canvas = document.createElement("canvas");
            this.canvas.setAttribute("id", id);
        } else {
            this.canvas = document.getElementById(id);
        }
        this.fixDPI();
        this.ctx = this.canvas.getContext("2d");
        this._pointsCached = false;

        this._paddingHorizantal = 0;
        this._paddingVertical = 0;

        this.adjustedWidth = this.canvas.width;
        this.adjustedHeight = this.canvas.height;

        this.xStretch = 0;
        this.yStretech = 0;
        this.lowestX = 0;
        this.lowestY = 0;

        this._lineWidth = 1;
        this._strokeColor = "black";
        this._fillColor = "white";

        var thisGraph = this; // TODO optimize
        this.canvas.addEventListener("mousemove", function(event) {
            if (thisGraph.points !== undefined && thisGraph.points.length > 0) {
                var x = event.clientX < thisGraph.canvas.getBoundingClientRect().left ? 0 : event.clientX > thisGraph.canvas.getBoundingClientRect().right ? thisGraph.canvas.getBoundingClientRect().right : event.clientX - thisGraph.canvas.getBoundingClientRect().left;

                var data = { x: 0, y: 0, adjustedX: 0 };
                var lowestDist = 999999999;
                for (var dataObj of thisGraph._data) {
                    var adjx = thisGraph.getAdjustedX(dataObj.x);
                    var dist = Math.abs(adjx - x);

                    if (dist < lowestDist) {
                        lowestDist = dist;
                        data.adjustedX = adjx;
                        data.x = dataObj.x;
                        data.y = dataObj.y;
                    }
                }
                var canvasYData = document.getElementById("canvasYData");
                canvasYData.style.display = "block";
                canvasYData.innerText = thisGraph.translateY(data.y);
                canvasYData.style.left = data.adjustedX + "px";
                var canvasXData = document.getElementById("canvasXData");
                canvasXData.style.display = "block";
                canvasXData.innerText = thisGraph.translateX(data.x);

                thisGraph.draw();
                thisGraph.ctx.beginPath();
                thisGraph.ctx.strokeStyle = thisGraph._lineColor;
                thisGraph.ctx.moveTo(data.adjustedX, 0);
                thisGraph.ctx.lineTo(data.adjustedX, thisGraph.canvas.height);
                thisGraph.ctx.stroke();

                thisGraph.ctx.beginPath();
                thisGraph.ctx.arc(data.adjustedX, thisGraph.getAdjustedY(data.y), 6, 0, Math.PI * 2);
                thisGraph.ctx.fillStyle = thisGraph._fillColor;
                thisGraph.ctx.fill();
                thisGraph.ctx.stroke();
            }
        });
    }

    filterData(d) {
        return true;
    }

    translateX(x) {
        return x;
    }

    translateY(y) {
        return y;
    }

    get lineColor() {
        return this._lineColor;
    }

    set lineColor(x) {
        this._lineColor = x;
    }

    get fillColor() {
        return this._fillColor;
    }

    set fillColor(x) {
        this._fillColor = x;
    }

    get paddingHorizantal() {
        return this._paddingHorizantal;
    }

    get paddingVertical() {
        return this._paddingVertical;
    }

    set paddingHorizantal(x) {
        this.adjustedWidth = this.canvas.width - x;
        this._paddingHorizantal = x;
    }

    set paddingVertical(x) {
        this.adjustedHeight = this.canvas.height - x;
        this._paddingVertical = x;
    }

    get elementId() {
        return this._elementId;
    }

    get data() {
        return this._data;
    }

    set data(x) {
        this._data = x;
        this._pointsCached = false;
    }

    get jsonData() {
        return this._jsonData;
    }

    set jsonData(x) {
        this._jsonData = x;
    }

    get lineWidth() {
        return this._lineWidth;
    }

    set lineWidth(x) {
        this._lineWidth = x;
    }

    get strokeColor() {
        return this._strokeColor;
    }

    set strokeColor(x) {
        this._strokeColor = x;
    }

    get pointsCached() {
        return this._pointsCached;
    }

    set pointsCached(x) {
        this._pointsCached = x;
    }

    drawAxes() {
        // draw axes
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.stroke();
    }

    draw() {
        this.fixDPI();

        if (this._data === undefined || this._data === null || this._data.length < 1
                || (this._pointsCached && (this.points === undefined || this.points === null || this.points.length < 1))) {
            this.ctx.beginPath();
            this.ctx.fillText('No Data to Display. Try another property', (this.canvas.width + this._paddingHorizantal) / 2 - 50, (this.canvas.height + this._paddingVertical) / 2);
            this.ctx.stroke();
            this._pointsCached = false;
            return;
        }

        if (this._pointsCached) {
            this.drawAxes();

            this.ctx.beginPath();
            this.ctx.lineWidth = this._lineWidth;
            this.ctx.strokeStyle = this._strokeColor;
            for (var i = 0; i < this.points.length; i++) {
                var point = this.points[i];
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            this.ctx.stroke();
        } else {
            this.points = new Array();

            this.averageY = 0;
            this.highestY = -1;
            this.lowestY = 9999999999;
            this.highestX = -1;
            this.lowestX = 999999999999999;
            var l = 0;
            for (var dataObj of this._data) {
                if (!this.filterData(dataObj)) continue;

                this.averageY += dataObj.y;
                l++;

                if (dataObj.x > this.highestX) this.highestX = dataObj.x;
                if (dataObj.x < this.lowestX) this.lowestX = dataObj.x;

                if (dataObj.y > this.highestY) this.highestY = dataObj.y;
                if (dataObj.y < this.lowestY) this.lowestY = dataObj.y;
            }
            this.xStretch = this.adjustedWidth / (this.highestX - this.lowestX);
            this.yStretch = this.adjustedHeight / (this.highestY - this.lowestY);
            this.averageY /= l;

            for (var d of this._data) {
                if (d.y > -1 && this.filterData(d)) this.points.push({ x: this.getAdjustedX(d.x), y: this.getAdjustedY(d.y) });
            }

            this.pointsCached = true;
            this.draw();
        }
    }

    fixDPI() {
        var dpi = window.devicePixelRatio;
        
        this.canvas.width = +getComputedStyle(this.canvas).getPropertyValue('width').slice(0, -2) * dpi;
        this.canvas.height = +getComputedStyle(this.canvas).getPropertyValue('height').slice(0, -2) * dpi;

        this.adjustedHeight = this.canvas.height - this._paddingVertical;
        this.adjustedWidth = this.canvas.width - this._paddingHorizantal;
    }

    getAdjustedX(x) {
        return (x - this.lowestX) * this.xStretch + this._paddingHorizantal / 2;
    }
    
    getAdjustedY(y) {
        return (this.adjustedHeight - (y - this.lowestY) * this.yStretch) + this._paddingVertical / 2;
    }
}
