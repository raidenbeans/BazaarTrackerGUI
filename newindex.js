/* Utils */
const selectedColor = "#dbdbdb"

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
loadJSONFile(filesDir + "categories.json", function(responseText) {
    var json = JSON.parse(responseText);
    for (var categoryName in json) {
        for (var i = 0; i < json[categoryName].length; i += 2) {
            var id = json[categoryName][i];
            
            var btn = document.createElement("label");
            btn.setAttribute("class", "itemButton");
            document.getElementById(categoryName + "Btn").parentElement.childNodes.forEach(function (node) {
                if (node.className === "dropdownContent") {
                    node.appendChild(btn);
                }
            });

            var chbx = document.createElement("input");
            chbx.setAttribute("type", "checkbox");
            chbx.setAttribute("class", "itemCheckbox");
            btn.appendChild(chbx);

            var img = document.createElement("img");
            img.setAttribute("class", "itemImage");
            img.setAttribute("id", id + "image");
            img.setAttribute("src", "assets/categories/buttons/" + id.replace(":", "+") + ".png");
            btn.appendChild(img);

            var p = document.createElement("p");
            p.textContent = json[categoryName][i + 1];
            p.innerText = json[categoryName][i + 1];
            btn.appendChild(p);
        }
    }
})

/* Register category buttons click functions */
var categoryCheckboxes = document.getElementsByClassName("categoryCheckbox");
for (var chbx of categoryCheckboxes) {
    chbx.addEventListener("change", function() {
        this.parentElement.backgroundColor = this.checked ? selectedColor : "white";
        this.parentElement.style.borderBottom = this.checked ? "2px solid #dbdbdb" : "0";
        for (var e of this.parentElement.parentElement.getElementsByClassName("dropdownContent")) {
            e.style.display = this.checked ? "block" : "none";
        }

        if (this.checked) {
            for (var i = 0; i < categoryCheckboxes.length; i++) {
                if (categoryCheckboxes[i] !== this) {
                    categoryCheckboxes[i].parentElement.backgroundColor = this.checked ? selectedColor : "white";
                }
            }
        }
    });
}

/* TEST */
var g = new Graph("canvas", [{x: 0, y: 200}, {x: 10, y: 0}, {x: 20, y: 200}, {x: 30, y: 0}]);
g.draw();