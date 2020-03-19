// item buttons creation and toggle logic
const __filesDir = '/productinfo/'
//const __filesDir = 'C:\\Users\\RaidenW\\Desktop\\BazaarTracker\\productinfo\\'
const __categoriesFileName = 'categories.json'

const farmingBtn = document.getElementById('farmingBtn')
const miningBtn = document.getElementById('miningBtn')
const combatBtn = document.getElementById('combatBtn')
const woodFishingBtn = document.getElementById('woodFishingBtn')
const odditiesBtn = document.getElementById('odditiesBtn')

var categories;
loadJSONFile(__filesDir + __categoriesFileName, function (response) {    
    categories = JSON.parse(response);
    
    console.log(response);
    for (var category in categories) {
        console.log(category);
        for (var i = 0; i < categories.length; i += 2) {
            productIds.push(categories[category][i].replace('\.product', '').replace('\+', ':'));
            
            console.log(productIds[i]);
        }
    }
    
    createButtons('farming', categories.farming);
    createButtons('mining', categories.mining);
    createButtons('combat', categories.combat);
    createButtons('woodFishing', categories.woodFishing);
//    createButtons('oddities', categories.oddities);
    
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
                
                updateCheckbox(true, this);
            } else {
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
            console.log(xhr.responseText);
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
    
//    console.log(chbx.parentElement.parentElement.getElementsByClassName('dropdown-content'));
    for (var n of chbx.parentElement.parentElement.getElementsByClassName('dropdown-content')[0].childNodes) {
        n.style.display = checked ? 'block' : 'none';
    }
}

// canvas and graphing drawing
const propertiesEnum = {
    HIGHEST_BUY_PRICE: 'highestBuyPrice',
    AVERAGE_BUY_PRICE: 'averageBuyPrice',
    
    LOWEST_SELL_PRICE: 'lowestSellPrice',
    AVERAGE_SELL_PRICE: 'averageSellPrice',
    
    QUICK_BUY_PRICE: 'quickBuyPrice',
    QUICK_BUY_VOLUME: 'quickBuyVolume',
    QUICK_BUY_MOVING_WEEK: 'quickBuyMovingWeek',
    QUICK_BUY_ORDERS: 'quickBuyOrders',
    
    QUICK_SELL_PRICE: 'quickSellPrice',
    QUICK_SELL_VOLUME: 'quickSellVolume',
    QUICK_SELL_MOVING_WEEK: 'quickSellMovingWeek',
    QUICK_SELL_ORDERS: 'quickSellOrders'
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
    drawGraph();
})

var dataToDisplay = new Array();
function updateCanvas(propertyType, selectedItemId) {
    loadJSONFile(__filesDir + selectedItemId.replace(':', '+') + '.product', function (responseText) {
        var json = JSON.parse(responseText);
        dataToDisplay = new Array();
        
        for (var property in json.productArray) {
            var obj = json.productArray[property];
            
            switch (propertyType) {
                case propertiesEnum.HIGHEST_BUY_PRICE:                
                    dataToDisplay.push({timeStamp: property, data: obj.buySummary[0].pricePerUnit});
                    break;
                case propertiesEnum.AVERAGE_BUY_PRICE:
                    var averageBuyPrice = 0;
                    var i = 0;
                    for (var buyData in obj.buySummary) {
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
                    for (var sellData in obj.sellSummary) {
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
            return a - b;
        });
        
        drawGraph();        
    });
}

function drawGraph(extra) {
    fixDPI();
    const graph = document.getElementById('graph');
    const graphWidth = graph.width;
    const graphHeight = graph.height - 20; // - int so there is padding on the top
    const ctx = graph.getContext('2d');
    const xSpacing = graphWidth / dataToDisplay.length;
    
    // draw borders
    ctx.moveTo(0, 0);
    ctx.lineTo(0, graph.height);
    ctx.lineTo(graphWidth, graph.height);
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
        var y = graph.height - (data * graphHeight / highestY);
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
        updateCanvas(propertiesEnum.HIGHEST_BUY_PRICE, btn.id.replace('Button', ''));
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

// canvas data on hover logic
document.getElementById('graph').addEventListener('mousemove', function (event) {
    const y = 20;
    
    drawGraph(function(graph, ctx) {
        ctx.beginPath();
        
        var x = event.clientX - graph.getBoundingClientRect().left;
        
        var d, ts;
        var lowestDist = 999999;
        for (var i = 0; i < dataToDisplay.length; i++) {
            var dist = Math.abs(graph.width / dataToDisplay.length * i - x)
            if (lowestDist > dist) {
                lowestDist = dist;
                Math.abs(graph.width / dataToDisplay.length * i - x);
                ts = dataToDisplay[i].timeStamp;
                d = dataToDisplay[i].data;
            }
        }
        
        ctx.fillText('Data: ' + d, x, y);
        ctx.fillText('Timestamp: ' + getTimeStampToTimeElapsed(ts) + ' ago', x, y * 2);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, graph.height);
        
        ctx.stroke();
    });
})

function getTimeStampToTimeElapsed(timeStamp) {
    var curDate = new Date();
    var elapsedTime = timeStamp - curDate.getMilliseconds();
    
    return Math.round(elapsedTime / 1000) + ' seconds';
}

document.getElementById('graph').addEventListener('mouseout', function() { drawGraph(); })