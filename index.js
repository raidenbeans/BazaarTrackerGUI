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
const filesDir = "C:\\Users\\RaidenW\\Desktop\\BazaarTracker\\productinfo\\"
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