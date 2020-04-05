/* Utils */
const selectedColor = "#dbdbdb"
var selectedItemId;
var xhr;
function loadJSONFile(file, callback) {
    xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open("GET", file, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status == "200") {
            callback(xhr.responseText);
        }
    }
    xhr.send(null);
}

/* Add item buttons */
const filesDir = "productinfo/"
var itemButtonCheckboxes = new Array();
loadJSONFile(filesDir + "categories.json", function(responseText) {
    var json = JSON.parse(responseText);
    for (var categoryName in json) {
        for (var i = 0; i < json[categoryName].length; i += 2) {
            var id = json[categoryName][i];
            var isEnchanted = id.includes("ENCHANTED");
            var imgSrc = "assets/categories/buttons/" + id.replace(":", "+") + ".png";

            var btn = document.createElement("label");
            btn.setAttribute("itemName", json[categoryName][i + 1]);
            btn.setAttribute("class", "itemButton");
            btn.setAttribute("id", id + "Btn")
            document.getElementById(categoryName + "Btn").parentElement.childNodes.forEach(function (node) {
                if (node.className === "dropdownContent") {
                    node.appendChild(btn);
                }
            });

            if (isEnchanted) {
                var imgContainer = document.createElement("div");
                imgContainer.setAttribute("class", "itemEnchantedContainer");
                imgContainer.style.maskImage = "url(" + imgSrc + ")";
                imgContainer.style.webkitMaskImage = "url(" + imgSrc + ")";
                btn.appendChild(imgContainer);
            }

            var img = document.createElement("img");
            img.setAttribute("class", "itemImage");
            img.setAttribute("src", imgSrc);
            img.setAttribute("display", "block")
            img.setAttribute("alt", "");
            if (isEnchanted) {
                img.style.mixBlendMode = "screen";
                img.style.opacity = "100%";
                imgContainer.appendChild(img);
            } else {
                btn.appendChild(img);
            }

            var p = document.createElement("p");
            p.textContent = json[categoryName][i + 1];
            p.innerText = json[categoryName][i + 1];
            btn.appendChild(p);

            btn.addEventListener("click", function () {
                selectedItemId = this.id.replace("Btn", "");

                document.getElementById("canvasItemName").innerText = this.getAttribute("itemName");
                var isEnchanted = this.id.includes("ENCHANTED");
                var imgSrc = "assets/categories/buttons/" + this.id.replace("Btn", "").replace(":", "+") + ".png";
                if (isEnchanted) {
                    var imgContainer = document.getElementById("canvasItemImageEnchanted");
                    imgContainer.style.maskImage = "url(" + imgSrc + ")";
                    imgContainer.style.webkitMaskImage = "url(" + imgSrc + ")";
                    document.getElementById("canvasHeader").appendChild(imgContainer);
                }
    
                var img = document.getElementById("canvasItemImage");
                img.setAttribute("class", "itemImage");
                img.setAttribute("src", imgSrc);
                if (isEnchanted) {
                    img.style.mixBlendMode = "screen";
                    img.style.opacity = "100%";
                    imgContainer.appendChild(img);
                } else {
                    document.getElementById("canvasHeader").appendChild(img);
                }

                if (this.parentElement.parentElement.nextElementSibling != null) this.parentElement.parentElement.nextElementSibling.style.borderTop = "0";
                products.clicked = false;
                document.getElementById("products").style.marginLeft = "-70%";
                document.getElementById("divider").style.left = "-70%";
                document.getElementById("rightArrow").style.display = "inline-block";
                var right = document.getElementById("right");
                right.style.width = "80%";
                right.style.left = "0";
                right.style.margin = "75px 120px";

                updateCanvas();
                document.getElementById("canvas").style.display = "block";

                setTimeout(function() {
                    graph.pointsCached = false;
                    graph.draw();
                }, 500);
            });
        }
    }
})

/* Add hover event to right arrow */
document.getElementById("rightArrow").addEventListener("mouseenter", function() {
    this.style.width = "70px";
    products.style.marginLeft = (70 - products.offsetWidth) + "px";
    divider.style.left = "69px";

    var arrow = document.getElementById("arrow");
    arrow.style.left = "120%";
    arrow.style.transform = "scaleX(-1) rotate(135deg)";

    for (var chbx of categoryCheckboxes) {
        chbx.checked = false;
        for (var e of this.parentElement.parentElement.getElementsByClassName("dropdownContent")) {
            e.style.display = this.checked ? "block" : "none";
        }
    }

    for (var child of document.getElementById("products").getElementsByTagName("label")) {
        child.style.flexDirection = "row-reverse";
        child.style.justifyItems = "flex-end";
    }
})

document.getElementById("rightArrow").addEventListener("mouseleave", function() {
    this.style.width = "25px";
    if (!products.clicked) {
        products.style.marginLeft = "-70%";
        divider.style.left = "-70%"
    }

    var arrow = document.getElementById("arrow");
    arrow.style.left = "-15px";
    arrow.style.transform = "scaleX(1) rotate(135deg)";

    for (var child of document.getElementById("products").getElementsByTagName("label")) {
        child.style.flexDirection = "row";
        child.style.justifyItems = "flex-start";
    }
})

document.getElementById("rightArrow").addEventListener("click", function() {
    this.style.display = "none";
    products.style.marginLeft = "0px";
    products.clicked = true;
    document.getElementById("divider").style.left = "var(--divider-left-space)";
    document.getElementById("rightArrow").style.display = "none";
    var right = document.getElementById("right");
    right.style.width = "var(--right-side-width)";
    right.style.left = "var(--divider-left-space)"
    right.style.margin = "75px 0 0 0";

    setTimeout(function() {
        graph.pointsCached = false;
        graph.draw();
    }, 500);
})

/* Register category buttons click functions */
var categoryCheckboxes = document.getElementsByClassName("categoryCheckbox");
for (var chbx of categoryCheckboxes) {
    chbx.addEventListener("change", function() {
        this.parentElement.backgroundColor = this.checked ? selectedColor : "white";
        if (this.parentElement.parentElement.nextElementSibling !== null) this.parentElement.parentElement.nextElementSibling.style.borderTop = this.checked ? "2px solid #dbdbdb" : "0";
        for (var e of this.parentElement.parentElement.getElementsByClassName("dropdownContent")) {
            e.style.display = this.checked ? "block" : "none";
        }
    });
}

/* Graph management */
const propertyTypes = {
    HIGHEST_BUY_PRICE: "Highest Buy Price",
    AVERAGE_BUY_PRICE: "Average Buy Price",
    LOWEST_BUY_PRICE: "Lowest Buy Price",
    
    LOWEST_SELL_PRICE: "Lowest Sell Price",
    AVERAGE_SELL_PRICE: "Average Sell Price",
    HIGHEST_SELL_PRICE: "Highest Sell Price",
    
    QUICK_BUY_PRICE: "Quick Buy Price",
    QUICK_BUY_VOLUME: "Quick Buy Volume",
    QUICK_BUY_MOVING_WEEK: "Quick Buy Moving Week",
    QUICK_BUY_ORDERS: "Quick Buy Orders",
    
    QUICK_SELL_PRICE: "Quick Sell Price",
    QUICK_SELL_VOLUME: "Quick Sell Volume",
    QUICK_SELL_MOVING_WEEK: "Quick Sell Moving Week",
    QUICK_SELL_ORDERS: "Quick Sell Orders"
}
Object.freeze(propertyTypes);

var properties = new Array();
properties.push(propertyTypes.LOWEST_SELL_PRICE);
var graph = new Graph("canvas");
graph.paddingVertical = 40;
graph.lineWidth = 1;
graph.strokeColor = "green";
graph.lineColor = "#737373";
graph.translateX = translateX;
graph.translateY = function(y) {
    var split = y.toString().split("\.");
    return split.length > 1 && split[1].length > 3 ? parseFloat(y).toFixed(3) : y;
}
var prevSelectedItemId = null;
function updateCanvas() {
    document.getElementById("loading").style.display = "block";
    if (prevSelectedItemId !== selectedItemId) {
        loadJSONFile(filesDir + selectedItemId.replace(":", "+") + ".product", function (responseText) {
            document.getElementById("loading").style.display = "none";
            graph.jsonData = JSON.parse(responseText + "}}");
            drawGraph();
        });
    } else {
        drawGraph();
    }
}

function translateX(x) {
    var elapsedSeconds = (Date.now() - x) / 1000; // time in s
  
    var weeks = Math.floor(elapsedSeconds / 604800);
    var days = Math.floor((elapsedSeconds - (weeks * 604800)) / 86400);
    var hours = Math.floor((elapsedSeconds - (weeks * 604800) - (days * 86400)) / 3600);
    var minutes = Math.floor((elapsedSeconds - (weeks * 604800) - (days * 86400) - (hours * 3600)) / 60);
//    var secs = Math.floor((elapsedSeconds - (weeks * 604800) - (days * 86400) - (hours * 3600) - (minutes * 60)));
    
    var str = weeks === 0 ? "" : weeks + " week" + (weeks > 1 ? "s " : " ");
    str += days === 0 ? "" : days + " day" + (days > 1 ? "s " : " ");
    str += hours === 0 ? "" : hours + " hour" + (hours > 1 ? "s " : " ");
    str += minutes + " minute" + (minutes === 0 || minutes > 1 ? "s" : "");
    
    return str + " ago";
}

function drawGraph() {
    graph.data = new Array();

    for (var timeStamp in graph.jsonData.productArray) {
        var dataObj = graph.jsonData.productArray[timeStamp];
        
        switch (properties[0]) { // TODO allow for multiple properties
            case propertyTypes.HIGHEST_BUY_PRICE:
                graph.data.push(dataObj.buySummary.length !== 0 ? dataObj.buySummary[0].pricePerUnit : -1);
                break;

            case propertyTypes.AVERAGE_BUY_PRICE:
                var total = 0;
                var i = 0;
                for (i = 0; i < dataObj.buySummary.length; i++) {
                    total += dataObj.buySummary[i].pricePerUnit;
                }
                graph.data.push({ x: timeStamp, y: i !== 0 ? total / i : -1 });
                break;
            
            case propertyTypes.LOWEST_BUY_PRICE:
                graph.data.push({ x: timeStamp, y: dataObj.buySummary.length !== 0 ? dataObj.buySummary[dataObj.buySummary.length - 1].pricePerUnit : -1 }); // TODO Make sure the graph object omits negative numbers
                break;

            case propertyTypes.LOWEST_SELL_PRICE:
                graph.data.push({ x: timeStamp, y: dataObj.sellSummary.length !== 0 ? dataObj.sellSummary[0].pricePerUnit : -1 });
                break;

            case propertyTypes.AVERAGE_SELL_PRICE:
                var total = 0;
                var i = 0;
                for (i = 0; i < dataObj.sellSummary.length; i++) {
                    total += dataObj.sellSummary[i].pricePerUnit;
                }
                graph.data.push({ x: timeStamp, y: total / i });
                break;

            case propertyTypes.HIGHEST_SELL_PRICE:
                graph.data.push({ x: timeStamp, y: dataObj.sellSummary.length !== 0 ? dataObj.sellSummary[dataObj.sellSummary.length - 1].pricePerUnit : -1 });
                break;

            case propertyTypes.QUICK_BUY_PRICE:
                graph.data.push({ x: timeStamp, y: dataObj.quickBuyPrice });
                break;

            case propertyTypes.QUICK_BUY_VOLUME:
                graph.data.push({ x: timeStamp, y: dataObj.quickBuyVolume });
                break;

            case propertyTypes.QUICK_BUY_MOVING_WEEK:
                graph.data.push({ x: timeStamp, y: dataObj.quickBuyMovingWeek });
                break;

            case propertyTypes.QUICK_BUY_ORDERS:
                graph.data.push({ x: timeStamp, y: dataObj.quickBuyOrders });
                break;

            case propertyTypes.QUICK_SELL_PRICE:
                graph.data.push({ x: timeStamp, y: dataObj.quickSellPrice });
                break;

            case propertyTypes.QUICK_SELL_VOLUME:
                graph.data.push({ x: timeStamp, y: dataObj.quickSellVolume });
                break;

            case propertyTypes.QUICK_SELL_MOVING_WEEK:
                graph.data.push({ x: timeStamp, y: dataObj.quickSellMovingWeek });
                break;

            case propertyTypes.QUICK_SELL_ORDERS:
                graph.data.push({ x: timeStamp, y: dataObj.quickSellOrders });
                break;
        }
    }

    graph.data.sort(function(a, b) {
        return a.timeStamp - b.timeStamp;
    });
    graph.draw();
}

function getTimeStampToTimeElapsed(timeStamp) {
    var elapsedSeconds = (Date.now() - timeStamp) / 1000; // time in s
    
    var days = Math.floor(elapsedSeconds / 86400);
    var hours = Math.floor((elapsedSeconds - (days * 86400 ))/3600)
    var minutes = Math.floor((elapsedSeconds - (days * 86400 ) - (hours *3600 ))/60)
    var secs = Math.floor((elapsedSeconds - (days * 86400 ) - (hours *3600 ) - (minutes*60)))
    
    var obj = {};
/*    if (months !== 0) {
        str += months + " Months ";
    }*/
    obj.days = days;
    obj.hours = hours;
    obj.minutes = minutes;
    
    return obj;
}

window.addEventListener("resize", function() {
    graph.pointsCached = false;
    graph.draw();
})

/* Time Buttons */
var timeButtonsChbxs = new Array();
var tbYTD = document.getElementById("timeButtonAllChbx");
var tbSixM = document.getElementById("timeButtonSixMChbx");
var tbOneM = document.getElementById("timeButtonOneMChbx")
var tbOneW = document.getElementById("timeButtonOneWChbx")
var tbThreeD = document.getElementById("timeButtonThreeDChbx")
var tbOneD = document.getElementById("timeButtonOneDChbx")
timeButtonsChbxs.push(tbYTD);
timeButtonsChbxs.push(tbSixM);
timeButtonsChbxs.push(tbOneM);
timeButtonsChbxs.push(tbOneW);
timeButtonsChbxs.push(tbThreeD);
timeButtonsChbxs.push(tbOneD);

// Default time is YTD (Year to Date)
graph.filterData = function() { updateDate(); return true; }

for (var tb of timeButtonsChbxs) {
    tb.addEventListener("change", function() {
        if (this.checked) {
            rewind = 0;
            this.parentElement.style.backgroundColor = selectedColor;
            for (var tb1 of timeButtonsChbxs) {
                if (tb1 !== this) {
                    tb1.checked = false;
                    tb1.parentElement.style.backgroundColor = "white";
                }
            }

            graph.filterData = this === tbYTD ? function() { updateDate(); return true; } : this === tbSixM ? filterSixM 
                             : this === tbOneM ? filterOneM : this === tbOneW ? filterOneW : this === tbThreeD ? filterThreeD : filterOneD;
            graph.pointsCached = false;
            graph.draw();
        }
    });
}

/* Rewind/Fastforward and time button graph filters */
var rewind = 0;

document.getElementById("rewind").addEventListener("click", function() {
    rewind++;
    graph.pointsCached = false;
    graph.draw();
});

document.getElementById("fastForward").addEventListener("click", function() {
    if (rewind > 0) {
        rewind--;
        graph.pointsCached = false;
        graph.draw();
    }
});

function updateDate(s0, s1) {
    const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    var d0 = new Date(s0);
    var d1 = s1 === 0 ? 0 : new Date(s1);

    console.log()

    document.getElementById("canvasTimeRange").innerText = s0 === undefined && s1 === undefined ? "All Time" 
                                                         : "From " + d0.getDate() + " " + months[d0.getMonth()] + " " + d0.getFullYear() + " to " 
                                                         + ((d1 === 0) ? "now" : d1.getDate() + " " + months[d1.getMonth()] + " " + d1.getFullYear());
}

function filter(d, seconds) { // TODO consider days in the previous months and optimize this
    var s = (Date.now() - d.x) / 1000; // elapsed seconds
    var s0 = seconds + seconds * rewind; // date farthest away from now in seconds
    var s1 = rewind * seconds; // date closest to now in seconds
    updateDate(Date.now() - s0 * 1000, rewind === 0 ? 0 : Date.now() - s1 * 1000);
    return s <= s0 && s >= s1;
}

function filterSixM(d) {
    return filter(d, 15778800);
}

function filterOneM(d) {
    return filter(d, 2629800);
}

function filterOneW(d) {
    return filter(d, 604800);
}

function filterThreeD(d) {
    return filter(d, 259200);
}

function filterOneD(d) {
    return filter(d, 86400);
}