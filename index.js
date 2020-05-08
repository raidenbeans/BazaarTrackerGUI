/* Utils */
const selectedColor = "#dbdbdb"
var selectedItemId;
const baseURL = "http://bazaargraph.xyz:7000/";
function loadJSONFile(file, callback) {
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open("GET", file, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status == "200") {
            callback(xhr.responseText);
        }
    }
    xhr.send(null);
}

function formatNumberString(num, decimals) {
    num = parseFloat(num);
    var str = num.toString().includes(".") ? num.toString().split(".")[0] : num.toString();

    var finalStr = [];
    var j = str.length + parseInt(str.length / 3);
    for (var i = 0; i < str.length; i++) {
        if (i !== 0 && i % 3 === 0) {
            finalStr[j] = ",";
            j--;
        }
        finalStr[j] = str[str.length - 1 - i];
        j--;
    }

    return finalStr.join("") + (num.toString().includes(".") ? "." + num.toFixed(decimals).toString().split(".")[1] : "");
}

/* Add item buttons */
var enchantedItems = [
    "REVENANT_FLESH", "REVENANT_VISCERA", "TARANTULA_WEB", "TARANTULA_SILK", "WOLF_TOOTH", "GOLDEN_TOOTH", "HOT_POTATO_BOOK", "COMPACTOR",
    "SUPER_COMPACTOR_3000", "HAMSTER_WHEEL", "CATALYST"
];

var centsPrecision = 10000;
function updateAverageLabel(id, avg) {
    var avgBuyPrice = avg.averageHighestBuyPrice / avg.averageHighestBuyPriceCount / centsPrecision;
    var avgSellPrice = avg.averageLowestSellPrice / avg.averageLowestSellPriceCount / centsPrecision;
    var curBuyPrice = avg.currentHighestBuyPrice / centsPrecision;
    var curSellPrice = avg.currentLowestSellPrice / centsPrecision;

    var pAvgBuy = document.getElementById("avgBuy" + id);
    pAvgBuy.textContent = "Buy\n" + formatNumberString(avgBuyPrice, 2);
    pAvgBuy.innerText = pAvgBuy.textContent;

    var buyArrow = document.getElementById("buyArrow" + id);
    if (curBuyPrice === avgBuyPrice) {
        buyArrow.classList.remove("statusArrowUp");
        buyArrow.classList.remove("statusArrowDown");
        buyArrow.classList.add("statusArrowNeutral");
    } else if (curBuyPrice > avgBuyPrice) {
        buyArrow.classList.remove("statusArrowNeutral");
        buyArrow.classList.remove("statusArrowDown");
        buyArrow.classList.add("statusArrowUp");
    } else {
        buyArrow.classList.remove("statusArrowNeutral");
        buyArrow.classList.remove("statusArrowUp");
        buyArrow.classList.add("statusArrowDown");
    }

    var sellArrow = document.getElementById("sellArrow" + id);
    if (curSellPrice === avgSellPrice) {
        sellArrow.classList.remove("statusArrowUp");
        sellArrow.classList.remove("statusArrowDown");
        sellArrow.classList.add("statusArrowNeutral");
    } else if (curBuyPrice > curSellPrice) {
        sellArrow.classList.remove("statusArrowNeutral");
        sellArrow.classList.remove("statusArrowDown");
        sellArrow.classList.add("statusArrowUp");
    } else {
        sellArrow.classList.remove("statusArrowNeutral");
        sellArrow.classList.remove("statusArrowUp");
        sellArrow.classList.add("statusArrowDown");
    }

    var pAvgSell = document.getElementById("avgSell" + id);
    pAvgSell.textContent = "Sell\n" + formatNumberString(avgSellPrice, 2);
    pAvgSell.innerText = pAvgSell.textContent;
}

loadCategoriesFile();
loadAveragesFile();
var itemButtonCheckboxes = new Array();
var averages = null;
var categoriesLoaded = false;
function loadAveragesFile() {
    loadJSONFile(baseURL + "files?product_averages", function(responseText1) {
        var json = JSON.parse(responseText1);

        if (json.success) {
            centsPrecision = json.response.CENTS_PRECISION;
            averages = json.response.averages;
            
            if (categoriesLoaded) {
                for (var id in averages) {
                    updateAverageLabel(id, averages[id]);
                }
            }
        }
    });
}

function loadCategoriesFile() {
    loadJSONFile(baseURL + "files?categories", function (responseText) {
        var json = JSON.parse(responseText).response;
        categoriesLoaded = true;

        for (var categoryName in json) {
            for (var i = 0; i < json[categoryName].length; i += 2) {
                var id = json[categoryName][i];
                var isEnchanted = id.includes("ENCHANTED") || enchantedItems.includes(id);
                var imgSrc = "assets/categories/buttons/" + id.replace(":", "+") + ".png";

                var btn = document.createElement("label");
                btn.setAttribute("itemName", json[categoryName][i + 1]);
                btn.setAttribute("class", "itemButton");
                btn.setAttribute("id", id + "Btn");
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
                p.innerText = p.textContent;
                btn.appendChild(p);

                var buyContainer = document.createElement("div");
                buyContainer.classList.add("buyContainer");
                btn.appendChild(buyContainer);

                var pAvgBuy = document.createElement("p");
                pAvgBuy.classList.add("avgBuy");
                pAvgBuy.id = "avgBuy" + id;
                buyContainer.appendChild(pAvgBuy);

                var buyArrow = document.createElement("div");
                buyArrow.id = "buyArrow" + id;
                buyArrow.classList.add("statusArrow");
                buyContainer.appendChild(buyArrow);

                var sellContainer = document.createElement("div");
                sellContainer.classList.add("sellContainer");
                btn.appendChild(sellContainer);

                var pAvgSell = document.createElement("p");
                pAvgSell.id = "avgSell" + id;
                sellContainer.appendChild(pAvgSell);

                var sellArrow = document.createElement("div");
                sellArrow.id = "sellArrow" + id;
                sellArrow.classList.add("statusArrow");
                sellContainer.appendChild(sellArrow);

                if (averages !== null) updateAverageLabel(id, averages[id]);

                btn.addEventListener("click", function () {
                    selectedItemId = this.id.replace("Btn", "");

                    document.getElementById("canvasItemName").innerText = this.getAttribute("itemName");
                    var isEnchanted = this.id.includes("ENCHANTED") || enchantedItems.includes(selectedItemId);
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

                    setTimeout(function () {
                        graph.pointsCached = false;
                        graph.draw();
                    }, 500);
                });
            }
        }
    });
}

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
    var right = document.getElementById("right");

    this.style.display = "none";
    products.style.marginLeft = "0px"; // TODO averages
    products.clicked = true;

    document.getElementById("divider").style.left = "var(--divider-left-space)";
    document.getElementById("rightArrow").style.display = "none";
    document.getElementById("canvasYData").style.display = "none";
    document.getElementById("canvasXData").style.display = "none";

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
const propertyTypes = new Array();
loadJSONFile(baseURL + "files?data_properties", function (responseText) {
    var json = JSON.parse(responseText).response;
    var i = 0;
    var prevElement;
    for (var element of json) {
        propertyTypes.push(element);

        if (i % 2 === 1) {
            var dropdown = document.getElementById("propertyDropdown");
            var container1 = document.createElement("div");
            var container2 = document.createElement("label");
            container2.setAttribute("id", prevElement);
            dropdown.appendChild(container1);
            container1.appendChild(container2);

            var checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            container2.appendChild(checkbox);

            var p = document.createElement("p");
            p.innerText = element;
            container2.appendChild(p);

            if (i === 1) {
                container1.style.backgroundColor = selectedColor;
                properties.push(container2.id);
                checkbox.checked = true;
                document.getElementById("propertyIds").innerText = element;
            }

            checkbox.addEventListener("change", function() {
                if (this.checked) {
                    this.parentElement.parentElement.style.backgroundColor = selectedColor;
                    properties.push(this.parentElement.id);
                } else {
                    if (properties.length > 1) {
                        this.parentElement.parentElement.style.backgroundColor = "white";
                        properties.splice(properties.indexOf(this.parentElement.id), 1);
                    } else {
                        this.checked = true;
                    }
                }
                document.getElementById("propertyIds").innerText = properties.length + " properties"

                if (properties.length == 1) {
                    document.getElementById("propertyIds").innerText = propertyTypes[propertyTypes.indexOf(properties[0]) + 1];
                }
                updateCanvas(true);
            });
        }
        prevElement = element;
        i++;
    }
    Object.freeze(propertyTypes);
});


var properties = new Array();
var graph = new Graph("canvas");
graph.paddingVertical = 40;
graph.lineWidth = 1;
graph.strokeColor = "green";
graph.lineColor = "#737373";
graph.translateX = translateX;
graph.translateY = function(y) {
    return formatNumberString(y, 2);
}
var prevSelectedItemId = null;
var retryAmount = 0;
const maxRetryAmount = 3;
function updateCanvas(refresh) {
    if ((selectedItemId != undefined && selectedItemId != null) && (refresh || prevSelectedItemId !== selectedItemId)) {
        document.getElementById("loading").style.display = "block";
        loadJSONFile(baseURL + "products?productId=" + selectedItemId + "&property=" + properties[0], function (responseText) {
            document.getElementById("loading").style.display = "none";
            try {
                var json = JSON.parse(responseText);

                if (!json.success) {
                    if (retryAmount === maxRetryAmount) {
                        retryAmount = 0;
                    } else {
                        retryAmount++;
                        updateCanvas(true);
                    }

                    graph.drawText("Error encountered while reading JSON. See console for more details");
                    console.log("Server side error while reading JSON. Success=false. ItemID='" + selectedItemId + "'. property='" + properties[0] + "'");
                    graph.clearDataCaches();
                    return;
                }

                graph.jsonData = json.response;
            } catch (e) {
                graph.drawText("Error encountered while reading JSON. See console for more details");
                console.error(e);
                graph.clearDataCaches();
                return;
            }

            drawGraph();
        });
        prevSelectedItemId = selectedItemId;
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

    for (var timeStamp in graph.jsonData) {
        var dataObj = graph.jsonData[timeStamp];
        graph.data.push({ x: timeStamp, y: dataObj });
    }

    graph.data.sort(function(a, b) {
        return a.timeStamp - b.timeStamp;
    });
    graph.draw();
}

window.addEventListener("resize", function() {
    graph.pointsCached = false;
    graph.draw();
});

/* Auto-refresh timer */
const refreshRate = 180_000;
setInterval(() => {
    updateCanvas(true);
    loadAveragesFile();
}, refreshRate);

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