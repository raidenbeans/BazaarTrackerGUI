// item buttons creation and toggle logic
const __filesDir = '/productinfo/'
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

function loadJSONFile(file, callback) {
    var xhr = new XMLHttpRequest();
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
    
    document.getElementById('loadingImg').style.display = 'block';
    loadJSONFile(__filesDir + selectedItemId.replace(':', '+') + '.product', function (responseText) {
        document.getElementById('loadingImg').style.display = 'none';
        var json = JSON.parse(responseText);
        dataToDisplay = new Array();
        
        var j = 0;
        for (var property in json.productArray) {
            // if out of the time period, continue to next element
            var timeElapsed = getTimeStampToTimeElapsed(property)
            if (!(timeElapsed.days < timePeriod[0].days && timeElapsed.days > timePeriod[1].days)) continue;
            
            j++;
            var obj = json.productArray[property];
            
            switch (propertiesEnum[propertyType]) {
                case propertiesEnum.HIGHEST_BUY_PRICE:
                    dataToDisplay.push({timeStamp: property, data: obj.buySummary[0].pricePerUnit});
                    break;
                case propertiesEnum.AVERAGE_BUY_PRICE:
                    var averageBuyPrice = 0;
                    var i = 0;
                    for (var buyData of obj.buySummary) {
                        averageBuyPrice += buyData.pricePerUnit;
                        i++;
                    }
                    averageBuyPrice /= i;
                    dataToDisplay.push({timeStamp: property, data: averageBuyPrice});
                    break;
                    
                case propertiesEnum.LOWEST_SELL_PRICE:
                    dataToDisplay.push({timeStamp: property, data: obj.sellSummary[0].pricePerUnit});
                    break;
                case propertiesEnum.AVERAGE_SELL_PRICE:
                    var averageSellPrice = 0;
                    var i = 0;
                    for (var sellData of obj.sellSummary) {
                        averageSellPrice += sellData.pricePerUnit;
                        i++;
                    }
                    averageSellPrice /= i;
                    dataToDisplay.push({timeStamp: property, data: averageSellPrice});
                    break;
                
                case propertiesEnum.QUICK_BUY_PRICE:
                    dataToDisplay.push({timeStamp: property, data: obj.quickBuyPrice});
                    break;
                case propertiesEnum.QUICK_BUY_VOLUME:
                    dataToDisplay.push({timeStamp: property, data: obj.quickBuyVolume});
                    break;
                case propertiesEnum.QUICK_BUY_MOVING_WEEK:
                    dataToDisplay.push({timeStamp: property, data: obj.quickBuyMovingWeek});
                    break;
                case propertiesEnum.QUICK_BUY_ORDERS:
                    dataToDisplay.push({timeStamp: property, data: obj.quickBuyOrders});
                    break;
                
                case propertiesEnum.QUICK_SELL_PRICE:
                    dataToDisplay.push({timeStamp: property, data: obj.quickSellPrice});
                    break;
                case propertiesEnum.QUICK_SELL_VOLUME:
                    dataToDisplay.push({timeStamp: property, data: obj.quickSellVolume});
                    break;
                case propertiesEnum.QUICK_SELL_MOVING_WEEK:
                    dataToDisplay.push({timeStamp: property, data: obj.quickSellMovingWeek});
                    break;
                case propertiesEnum.QUICK_SELL_ORDERS:
                    dataToDisplay.push({timeStamp: property, data: obj.quickSellOrders});
                    break;
            }
        }
        dataToDisplay.sort(function(a, b) {
            return a.timeStamp - b.timeStamp;
        });
        
        fixDPI();
        drawGraph();
    });
}

function drawGraph(extra) {
    const graph = document.getElementById('graph');
    const graphWidth = graph.width;
    const graphHeightAdjusted = graph.height - 20; // - int so there is padding on the top
    const ctx = graph.getContext('2d');
    const xSpacing = graphWidth / dataToDisplay.length;
    
    // draw borders
    ctx.moveTo(0, 0);
    ctx.lineTo(0, graph.height);
    ctx.lineTo(graphWidth, graph.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(0, graph.height / 2);
    ctx.lineTo(graphWidth, graph.height / 2);
    ctx.stroke();
    
    // drawing the graph
    // get highest X and Y values to ensure graph fits on screen
    var highestX = 1;
    var highestY = 1;
    for (var dataObj of dataToDisplay) {            
        if (dataObj.timeStamp > highestX) highestX = dataObj.timeStamp;
        if (dataObj.data > highestY) highestY = dataObj.data;
    }
    
    ctx.beginPath();
    ctx.strokeStyle = '#33cc33';
    for (var i = 0; i < dataToDisplay.length; i++) {
        var timeStamp = dataToDisplay[i].timeStamp;
        var data = dataToDisplay[i].data;
        var x = xSpacing * i;
        var y = graph.height - (data * graphHeightAdjusted / highestY);
        if (i === 0) {
            ctx.moveTo(0, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    if (extra !== undefined) extra(graph, ctx);
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
        
        var d = 0;
        var ts = 0;
        var lowestDist = 999999;
        for (var i = 0; i < dataToDisplay.length; i++) {
            var dist = Math.abs(graph.width / dataToDisplay.length * i - x)
            if (lowestDist > dist) {
                lowestDist = dist;
                Math.abs(graph.width / dataToDisplay.length * i - x);
                ts = dataToDisplay[i].timeStamp;
                d = dataToDisplay[i].data;
                
                finalX = graph.width / dataToDisplay.length * i;
            }
        }
        
        var textX = finalX;
        if (x > graph.width / 2) {
            textX -= 200;
        }
        ctx.fillText('Data: ' + d, textX, y);
        
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

// time button logic
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