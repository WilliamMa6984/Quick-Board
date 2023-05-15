
function imageBoardify() {
	minSize = 150;
    
    // Create new page
    html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Quick Board</title>
        <style>
    body {
        background-color: #202124;
    }
    
    #imgPreviewList img {
        position: absolute;
        cursor: move;
        height: auto;
        border-radius: 8px;
    }
    
    #imgPreviewList .sliderDiv {
        position: absolute;
        top: 0;
        left: 0;
    
        opacity: 0;
        transition: opacity 0.3s;
    }
        </style>
    </head>
    
    <body>
        
        <div>
            <input type="text" id="inputLink" placeholder="Enter URL of image" name="inputLink">
            <input type="submit" id="btnAdd" value="Add">
            <input type="submit" id="btnRescale" value="Rescale">
        </div>
    
        <div id="imgPreviewList"></div>
        <div id="imgTemp">`;
    
        imgs = document.querySelectorAll("img");
        for (let i = 0; i < imgs.length; i++) {
            s = imgs[i];
            
            if (s.clientWidth < minSize) { continue; } // Ignore icons
    
            html += s.outerHTML
        }

        html += `</div>
    
    </body>
    
    </html>
    `;

    newHTML = document.open("text/html", "replace");
    newHTML.write(html);
    newHTML.close();
}


function inject() {

    const targ = 160000;
    count = 1;
    
    document.getElementById("btnAdd").onclick = clickHandler;
    document.getElementById("btnRescale").onclick = clickHandler;

    convertExistingImages();
    function convertExistingImages() {
        imgs = document.querySelectorAll("#imgTemp img");
        console.log(imgs);
        for (let i = 0; i < imgs.length; i++) {
            s = imgs[i];
    
            add(s.src)
        }

        document.getElementById("imgTemp").remove()
    }

    function clickHandler(event) {
        element = event.target
        console.log(element)
        if (element.id == "btnAdd") {
            add(document.getElementById("inputLink").value)
        } else if (element.id == "btnRescale") {
            rescaleAll()
        }
    }

    // ================= Button Clicks =================

    function add(url){
        console.log(url)
        if (url == '') {
            return;
        }

        // Append image
        const img = document.createElement("img");
        img.src = url;
        img.className = count;

        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = count;
        slider.oninput = updateSlider;
        slider.min = 100;
        slider.max = 1000;
        slider.value = 250;

        const btn = document.createElement("button");
        btn.className = count;
        btn.onclick = removeImage;
        btn.textContent = "Delete";

        const sliderDiv = document.createElement("div");
        sliderDiv.className = "sliderDiv";
        sliderDiv.appendChild(slider);
        sliderDiv.appendChild(btn);

        const div = document.createElement("div");
        div.appendChild(img);
        div.appendChild(sliderDiv);
        div.id = "div" + count;

        div.onmouseover = imgHover;
        div.onmouseout = imgHoverOut;
        document.getElementById("imgPreviewList").appendChild(div);

        makeDraggable(img);
        
        img.onload = () => {
            rescale(img)
        }
        
        // Increment
        count++;

        document.getElementById("inputLink").value = "";

    }

    function imgHover(ev) {
        slider = document.querySelector("#div" + ev.target.className + " .sliderDiv");
        if (slider != null) {
            slider.style.opacity = 1;
        }
    }
    function imgHoverOut(ev) {
        slider = document.querySelector("#div" + ev.target.className + " .sliderDiv");
        if (slider != null) {
            slider.style.opacity = 0;
        }
    }

    function updateSlider(ev) {
        el = ev.target;

        img = document.querySelector("#div" + ev.target.className + " img");

        img.style.width = el.value + 'px';
    }

    function removeImage(ev) {
        selectedDiv = document.querySelector("#div" + ev.target.className);
        selectedDiv.remove();
    }

    function rescale(img) {
        img.style.width = '250px';
        w = img.clientWidth;
        h = img.clientHeight;

        scale = targ/(w*h);
        img.style.width = (w*Math.sqrt(scale)) + 'px';
    }

    function rescaleAll() {
        imgs = document.querySelectorAll("#imgPreviewList img");
        for (let i = 0; i < imgs.length; i++) {
            s = imgs[i];

            s.style.width = '250px';
            w = s.clientWidth;
            h = s.clientHeight;

            scale = targ/(w*h);
            s.style.width = (w*Math.sqrt(scale)) + 'px';
        }
    }

    // ================= Helper functions =================

    function makeDraggable(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        elmnt.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

            elmntSlider = document.querySelector("#div" + elmnt.className + " .sliderDiv");
            elmntSlider.style.top = (elmnt.offsetTop - pos2) + "px";
            elmntSlider.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: imageBoardify
    }).then(chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: inject
    }))
});