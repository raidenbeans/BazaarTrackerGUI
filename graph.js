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
        this.pointsCached = false;

        this._paddingLeft = 0;
        this._paddingTop = 0;

        this.adjustedWidth = this.canvas.width;
        this.adjustedHeight = this.canvas.height;

        this.graphXStretch = 0;
        this.graphYStretch = 0;
        this.lowestX = 0;
        this.lowestY = 0;

        this._lineWidth = 1;
        this._lineColor = "black";
    }

    get paddingLeft() {
        return this._paddingLeft;
    }

    get paddingTop() {
        return this._paddingTop;
    }

    set paddingLeft(x) {
        this.adjustedWidth = this.canvas.width - x;
        this._paddingLeft = x;
    }

    set paddingTop(x) {
        this.adjustedHeight = this.canvas.height - x;
        this._paddingTop = x;
    }

    get elementId() {
        return this._elementId;
    }

    get data() {
        return this._data;
    }

    set data(x) {
        this._data = x;
        this.pointsCached = false;
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

    get lineColor() {
        return this._lineColor;
    }

    set lineColor(x) {
        this._lineColor = x;
    }

    drawAxes() {
        this.ctx.beginPath();
        this.ctx.moveTo(this._paddingLeft, this._paddingTop);
        this.ctx.lineTo(this._paddingLeft, this.adjustedHeight);
        this.ctx.lineTo(this.adjustedWidth, this.adjustedHeight);
        this.ctx.stroke();
    }

    draw() {
        this.fixDPI();

        if (this._data === undefined || this._data === null || this._data.length < 1) {
            this.ctx.beginPath();
            this.ctx.fillText('No Data to Display. Try another property', (this.canvas.width + this._paddingLeft) / 2 - 50, (this.canvas.height + this._paddingTop) / 2);
            this.ctx.stroke();
            this.pointsCached = false; 
            return;
        }

        if (this.pointsCached) {
            this.drawAxes();

            this.ctx.beginPath();
            this.ctx.lineWidth = this._lineWidth;
            this.ctx.strokeStyle = this._lineColor;
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
            this.points.length = 0;

            var highestY = -1;
            this.lowestY = 9999999999;
            var highestX = -1;
            this.lowestX = 999999999999999;
            for (var dataObj of this.data) {
                if (dataObj.x > highestX) highestX = dataObj.x;
                if (dataObj.x < this.lowestX) this.lowestX = dataObj.x;

                if (dataObj.y > highestY) highestY = dataObj.y;
                if (dataObj.y < this.lowestY) this.lowestY = dataObj.y;
            }
            this.xStretch = this.adjustedWidth / (highestX - this.lowestX);
            this.yStretch = this.adjustedHeight / (highestY - this.lowestY);

            for (var d of this.data) {
                this.points.push({ x: this.getAdjustedX(d.x), y: this.getAdjustedY(d.y) })
            }

            this.pointsCached = true;
            this.draw();
        }
    }

    fixDPI() {
        var dpi = window.devicePixelRatio;
        
        this.canvas.width = +getComputedStyle(this.canvas).getPropertyValue('width').slice(0, -2) * dpi;
        this.canvas.height = +getComputedStyle(this.canvas).getPropertyValue('height').slice(0, -2) * dpi;
    }

    getAdjustedX(x) {
        return (x - this.lowestX) * this.xStretch;
    }
    
    getAdjustedY(y) {
        return this.adjustedHeight - (y - this.lowestY) * this.yStretch;
    }
}
