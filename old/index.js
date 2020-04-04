// item buttons creation and toggle logic
//const __filesDir = '/productinfo/'
const __filesDir = 'c:\\users\\raidenw\\desktop\\bazaartracker\\productinfo\\'
const __categoriesFileName = 'categories.json'

const farmingBtn = document.getElementById('farmingBtn')
const miningBtn = document.getElementById('miningBtn')
const combatBtn = document.getElementById('combatBtn')
const woodFishingBtn = document.getElementById('woodFishingBtn')
const odditiesBtn = document.getElementById('odditiesBtn')

var categories;
loadJSONFile(__filesDir + __categoriesFileName, function (response) {    
    categories = JSON.parse(response);
    for (var category in categories) {
        for (var i = 0; i < categories.length; i += 2) {
            productIds.push(categories[category][i].replace('\.product', '').replace('\+', ':'));
        }
    }
    
    createButtons('farming', categories.farming);
    createButtons('mining', categories.mining);
    createButtons('combat', categories.combat);
    createButtons('woodFishing', categories.woodFishing);
    createButtons('oddities', categories.oddities);
    
    var itemCheckboxes = document.getElementsByClassName('itemCheckbox');
    for (chbx of itemCheckboxes) {
        chbx.addEventListener('change', function() {
            updateSelectedButton(this.checked, this.parentElement);
        
            if (this.checked) {
               for (var j = 0; j < itemCheckboxes.length; j++) {
                    if (this !== itemCheckboxes[j]) {
                        updateCheckbox(false, itemCheckboxes[j]);
                    }
                }
                
                document.getElementById('datatypeDropdown').style.display = 'block';
                document.getElementById('timeButtonsContainer').style.display = 'block';
                updateCheckbox(true, this);
            } else {
                document.getElementById('datatypeDropdown').style.display = 'none';
                document.getElementById('timeButtonsContainer').style.display = 'none';
                updateCheckbox(false, this);
            }
        });
    }
});

function updateCheckbox(checked, chbx) {
    chbx.parentElement.style.backgroundColor = checked ? '#dbdbdb' : 'white';
    chbx.checked = checked;
}

function createButtons(categoryName, category) {
    for (var i = 0; i < category.length; i += 2) {
        var id = category[i];
        var btn = document.createElement('label');
        btn.setAttribute('class', 'button');
        btn.setAttribute('id', id + 'Button');
        document.getElementById(categoryName + 'Btn').parentElement.childNodes.forEach(function(node) {
            if (node.className === 'dropdown-content') {
                node.appendChild(btn);
            }
        });
        
        var chbx = document.createElement('input');
        chbx.setAttribute('type', 'checkbox');
        chbx.setAttribute('class', 'itemCheckbox');
        btn.appendChild(chbx);
        
        var p = document.createElement('p');
        p.textContent = category[i + 1];
        p.innerText = category[i + 1];
        btn.appendChild(p);
        
        var blankLine = document.createElement('p');
        blankLine.setAttribute('class', 'blankLine');
        btn.appendChild(blankLine);
        
        var img = document.createElement('img');
        img.setAttribute('class', 'buttonImage');
        img.setAttribute('id', id + 'image');
        img.setAttribute('src', 'assets/categories/buttons/' + id.replace(':', '+') + '.png');
        btn.appendChild(img);
    }
}

var xhr;
function loadJSONFile(file, callback) {
    xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', file, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status == '200') {
            callback(xhr.responseText);
        }
    }
    xhr.send(null);
}

// category buttons toggle logic
var categoryInputs = document.getElementsByClassName('categoryCheckbox');
for (var input of categoryInputs) {
    input.addEventListener('change', function() {
        if (this.checked) {
            for (var j = 0; j < categoryInputs.length; j++) {
                if (this !== categoryInputs[j]) {
                    updateCategoryCheckbox(false, categoryInputs[j]);
                }
            }
            
            updateCategoryCheckbox(true, this);
        } else {
            updateCategoryCheckbox(false, this);
        }
    });
}

function updateCategoryCheckbox(checked, chbx) {
    updateCheckbox(checked, chbx);
    
    for (var n of chbx.parentElement.parentElement.getElementsByClassName('dropdown-content')[0].childNodes) {
        n.style.display = checked ? 'block' : 'none';
    }
}

// canvas and graphing drawing
const propertiesEnum = {
    HIGHEST_BUY_PRICE: 'Highest Buy Price',
    AVERAGE_BUY_PRICE: 'Average Buy Price',
    
    LOWEST_SELL_PRICE: 'Lowest Sell Price',
    AVERAGE_SELL_PRICE: 'Average Sell Price',
    
    QUICK_BUY_PRICE: 'Quick Buy Price',
    QUICK_BUY_VOLUME: 'Quick Buy Volume',
    QUICK_BUY_MOVING_WEEK: 'Quick Buy Moving Week',
    QUICK_BUY_ORDERS: 'Quick Buy Orders',
    
    QUICK_SELL_PRICE: 'Quick Sell Price',
    QUICK_SELL_VOLUME: 'Quick Sell Volume',
    QUICK_SELL_MOVING_WEEK: 'Quick Sell Moving Week',
    QUICK_SELL_ORDERS: 'Quick Sell Orders'
}

var propertiesToDisplay = new Array();
var index = 0;
for (key in propertiesEnum) {
    var btn = document.createElement('label');
    btn.setAttribute('id', key + 'Button');
    document.getElementById('datatypeDropdown-content').appendChild(btn);
    
    var container = document.createElement('div');
    container.setAttribute('border', '2px solid blue');
    btn.appendChild(container);
    
    var p = document.createElement('p');
    p.innerText = propertiesEnum[key];
    p.textContent = propertiesEnum[key];
    container.appendChild(p);
    
    var chbx = document.createElement('input');
    chbx.setAttribute('type', 'checkbox');
    if (index === 0) {
        chbx.checked = true;
        container.style.backgroundColor = '#39a9ef'
        propertiesToDisplay.push(key);
    }
    chbx.addEventListener('change', function() {        
        this.parentElement.style.backgroundColor = this.checked ? '#39a9ef' : 'white';
        
        var prop = this.parentElement.parentElement.id.replace('Button', '');
        if (this.checked) {
            propertiesToDisplay.push(prop);
        } else {
            for (var i = 0; i < propertiesToDisplay.length; i++) {
                if (propertiesToDisplay[i] === prop) {
                    propertiesToDisplay.splice(i, 1);
                    break;
                }
            }
        }
        updateCanvas();
    });
    container.appendChild(chbx);
    
    index++;
}

function fixDPI() {
    var dpi = window.devicePixelRatio;
    
    let style = {
        height() {
            return +getComputedStyle(canvas).getPropertyValue('height').slice(0,-2);
        },
        width() {
            return +getComputedStyle(canvas).getPropertyValue('width').slice(0,-2);
        }
    }
    var canvas = document.getElementById('graph');
    canvas.setAttribute('width', style.width() * dpi);
    canvas.setAttribute('height', style.height() * dpi);
}

window.addEventListener('resize', function(e) {
    fixDPI();
    drawGraph();
})

var selectedItemId
var timePeriod = new Array()
timePeriod.push({ days: 99999 });
timePeriod.push({ days: -1 });
var dataToDisplay = new Array()
function updateCanvas() {
    var propertyType;
    if (propertiesToDisplay.length === 0) {
        for (var property in propertiesEnum) {
            propertyType = property;
        }
    } else {
        propertyType = propertiesToDisplay[0];
    }
    
    if (xhr !== undefined) xhr.abort();
    document.getElementById('loadingImg').style.display = 'block';
    
}

// zoo event: 2 days 14 hours. Spooky event: 5 days 4 hours. Christmas Event: 5 days 4 hours. New Year: 5 days 4 hours
var events = {
    "zoo": {
        "milliseconds": 223200000,
        "fillColor": "#c4a746"
    },
    "halloween": {
        "milliseconds": 446400000,
        "fillColor": "#ea6e13"
    },
    "christmas": {
        "milliseconds": 446400000,
        "fillColor": "#d42426"
    },
    "newyear": {
        "milliseconds": 446400000,
        "fillColor": "#dbe2eb"
    }
}

var graphYStretch = 0;
var graphXStretch = 0;
function drawGraph(extra) {
    const graph = document.getElementById('graph');
    const graphWidth = graph.width;
    var graphHeight = graph.height;
    var padding = 25;
    const ctx = graph.getContext('2d');
    
    if (dataToDisplay.length < 1) {
        ctx.fillText('No Data to Display. Try another property', graphWidth / 2 - 50, graphHeight / 2);
        ctx.stroke();
        return;
    }

    // drawing borders
    ctx.moveTo(0, 0);
    ctx.lineTo(0, graph.height);
    ctx.lineTo(graphWidth, graph.height);
    ctx.stroke();

    // getting important data for drawing
    var highestY = -1;
    var lowestY = 9999999999;
    var highestX = -1;
    var lowestX = 999999999999999;
    for (var dataObj of dataToDisplay) {
        if (dataObj.data > highestY) highestY = dataObj.data;
        if (dataObj.data < lowestY) lowestY = dataObj.data;

        if (dataObj.timeStamp > highestX) highestX = dataObj.timeStamp;
        if (dataObj.timeStamp < lowestX) lowestX = dataObj.timeStamp;
    }
    graphYStretch = (graphHeight - padding) / (highestY - lowestY);
    graphXStretch = graphWidth / (highestX - lowestX);

    // drawing the events
    for (var eventName in events) {
        var event = events[eventName];
        var offset = lowestX % event.milliseconds;
        var val = lowestX - offset + event.milliseconds;

        // TODO. Not adding all events
        console.log(eventName);
        for (var val = lowestX - offset + event.milliseconds; val < highestX; val += event.milliseconds) {
            console.log(getTimeStampToTimeElapsed(val));

            var y = 0;
            var lowestDist = 9999999;
            for (var i = 0; i < dataToDisplay.length; i++) {
                var dist = Math.abs(getAdjustedX(dataToDisplay[i].timeStamp, graphXStretch, lowestX) - getAdjustedX(val, graphXStretch, lowestX));
                if (lowestDist > dist) {
                    lowestDist = dist;
                    y = dataToDisplay[i].data;
                }
            }

            ctx.beginPath();

            ctx.arc(getAdjustedX(val, graphXStretch, lowestX), getAdjustedY(y, graphYStretch, graphHeight, lowestY, padding), 6, 0, Math.PI * 2);
            ctx.fillStyle = event.fillColor;
            ctx.fill();
            ctx.stroke();
        }
    }

    // drawing the data
    ctx.beginPath();
    ctx.strokeStyle = '#33cc33';
    for (var i = 0; i < dataToDisplay.length; i++) {
        var dataObj = dataToDisplay[i];
        var x = getAdjustedX(dataObj.timeStamp, graphXStretch, lowestX);
        var y = getAdjustedY(dataObj.data, graphYStretch, graphHeight, lowestY, padding);
        if (i === 0) {
            ctx.moveTo(0, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    if (extra !== undefined) extra(graph, ctx);
}

function getAdjustedX(x, xStretch, lowestX) {
    return (x - lowestX) * xStretch;
}

function getAdjustedY(y, yStretch, graphHeight, lowestY, padding) {
    return ((graphHeight - (padding === undefined ? 0 : padding)) - (y - lowestY) * yStretch) + (padding === undefined ? 0 : padding / 2);
}

function updateSelectedButton(checked, btn) {
    var txt;
    var graphHeading = document.getElementById('graphHeading');
    if (checked) {
        txt = findItemName(btn.id.replace('Button', ''));
        document.getElementById('graphContainer').style.display = 'inline-block';
        selectedItemId = btn.id.replace('Button', '');
        updateCanvas();
    } else {
        txt = '';
        document.getElementById('graphContainer').style.display = 'none';
    }
    graphHeading.textContent = txt;
    graphHeading.innerText = txt;
}

function findItemName(item) {
    if (categories.farming.includes(item)) {
        return categories.farming[categories.farming.indexOf(item) + 1];
    } else if (categories.mining.includes(item)) {
        return categories.mining[categories.mining.indexOf(item) + 1];
    } else if (categories.combat.includes(item)) {
        return categories.combat[categories.combat.indexOf(item) + 1];
    } else if (categories.woodFishing.includes(item)) {
        return categories.woodFishing[categories.woodFishing.indexOf(item) + 1];
    } else if (categories.oddities.includes(item)) {
        return categories.oddities[categories.oddities.indexOf(item) + 1];
    } else {
        return '';
    }
}

// canvas specific data on hover logic
document.getElementById('graphContainer').addEventListener('mousemove', function(event) {
    const y = 20;
    
    fixDPI();
    drawGraph(function(graph, ctx) {
        ctx.beginPath();
        
        var x = (event.clientX < graph.getBoundingClientRect.left) ? 0 : (event.clientX > graph.getBoundingClientRect.right) ? graph.getBoundingClientRect.right : event.clientX - graph.getBoundingClientRect().left;
        var finalX = x;
        
        var lowestX = 999999999999999;
        for (var data of dataToDisplay) {
            if (data.timeStamp < lowestX) lowestX = data.timeStamp;
        }

        var d = 0;
        var ts = 0;
        var lowestY = 9999999;
        var lowestDist1 = 9999999;
        for (var i = 0; i < dataToDisplay.length; i++) {
            if (dataToDisplay[i].data < lowestY) {
                lowestY = dataToDisplay[i].data;
            }

            var dist = Math.abs(getAdjustedX(dataToDisplay[i].timeStamp, graphXStretch, lowestX) - x);
            if (lowestDist1 > dist) {
                lowestDist1 = dist;
                ts = dataToDisplay[i].timeStamp;
                d = dataToDisplay[i].data;
                
                finalX = getAdjustedX(ts, graphXStretch, lowestX);
            }
        }
        
        // drawing Text and line
        var textX = finalX;
        if (x > graph.width / 2) {
            textX -= 200;
        }
        ctx.fillText('Data: ' + parseFloat(d).toFixed(3), textX, y);

        var timeElapsed = getTimeStampToTimeElapsed(ts);
        var str = '';
        if (timeElapsed.days !== 0) {
            str += timeElapsed.days + ' Days ';
        }
        if (timeElapsed.hours !== 0) {
            str += timeElapsed.hours + ' Hours ';
        }
        str += timeElapsed.minutes + ' Minutes';
        ctx.fillText('Timestamp: ' + str + ' Ago', textX, y * 2);
        
        ctx.moveTo(finalX, 0);
        ctx.lineTo(finalX, graph.height);
        
        ctx.stroke();
        
        // drawing circle that intersects line
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.arc(finalX, getAdjustedY(d, graphYStretch, graph.height, lowestY, 25), 6, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();
    });
})

function getTimeStampToTimeElapsed(timeStamp) {
    var elapsedSeconds = (Date.now() - timeStamp) / 1000; // time in s
    
    var days = Math.floor(elapsedSeconds / 86400);
    var hours = Math.floor((elapsedSeconds - (days * 86400 ))/3600)
    var minutes = Math.floor((elapsedSeconds - (days * 86400 ) - (hours *3600 ))/60)
    var secs = Math.floor((elapsedSeconds - (days * 86400 ) - (hours *3600 ) - (minutes*60)))
    
    var obj = {};
/*    if (months !== 0) {
        str += months + ' Months ';
    }*/
    obj.days = days;
    obj.hours = hours;
    obj.minutes = minutes;
    
    return obj;
}

document.getElementById('graph').addEventListener('mouseout', function() { fixDPI(); drawGraph(); })

// time button + rewind/forward logic
var timeButtonCheckboxes = new Array()
var timeButtonAll = document.getElementById('timeButtonAllChbx')
var timeButtonSixM = document.getElementById('timeButtonSixMChbx')
var timeButtonOneM = document.getElementById('timeButtonOneMChbx')
var timeButtonOneW = document.getElementById('timeButtonOneWChbx')
var timeButtonThreeD = document.getElementById('timeButtonThreeDChbx')
var timeButtonOneD = document.getElementById('timeButtonOneDChbx')

timeButtonCheckboxes.push(timeButtonAll)
timeButtonCheckboxes.push(timeButtonSixM)
timeButtonCheckboxes.push(timeButtonOneM)
timeButtonCheckboxes.push(timeButtonOneW)
timeButtonCheckboxes.push(timeButtonThreeD)
timeButtonCheckboxes.push(timeButtonOneD)

for (var timeButton of timeButtonCheckboxes) {
    timeButton.addEventListener('change', function () {
        if (this.checked) {    
            for (var tb of timeButtonCheckboxes) {
                if (tb !== this) {
                    updateCheckbox(false, tb);
                }
            }
            
            updateCheckbox(true, this);
            timePeriod = new Array();
            if (this === timeButtonAll) {
                timePeriod.push({ days: 99999 });
            } else if (this === timeButtonSixM) {
                timePeriod.push({ days: 180 });
            } else if (this === timeButtonOneM) {
                timePeriod.push({ days: 30 });
            } else if (this === timeButtonOneW) {
                timePeriod.push({ days: 7 });
            } else if (this === timeButtonThreeD) {
                timePeriod.push({ days: 3 });
            } else if (this === timeButtonOneD) {
                timePeriod.push({ days: 1 });
            }
            timePeriod.push({ days: -1 });
            
            if (selectedItemId !== undefined) updateCanvas();
        } else {
            this.checked = true;
        }
    })
}

var timeCount = 0;
document.getElementById('timeRewindLeft').addEventListener("click", function() {
    timeCount--;
    updateTimePeriod();
})

document.getElementById('timeRewindRight').addEventListener("click", function() {
    timeCount++;
    updateTimePeriod();
})

function updateTimePeriod() {
    if (timePeriod[0].days < 99999) {
        var toPush0 = { days: timePeriod[0].days - (timeCount === 0 ? 0 : timePeriod[0].days / timeCount) };
        var toPush1 = { days: timePeriod[0].days };

        timePeriod = new Array();
        timePeriod.push(toPush0);
        timePeriod.push(toPush1);

        console.log('0');
        console.log(timePeriod[0]);
        console.log('1');
        console.log(timePeriod[1]);
    }
}