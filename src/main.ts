import '@picocss/pico/css/pico.css';
import './style.css'
import {Map, setWorkerUrl} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

import fhaMapData from "./data/fha-map-data.json"

setWorkerUrl(workerUrl);

const downloadListUl = document.getElementById("download-list")
fhaMapData.items.sort(function(a, b) {
    return a.title.localeCompare(b.title);
});
fhaMapData.items.map(item => {
    const liEl = document.createElement("li");
    liEl.innerHTML = `<a href="${item.id}">${item.title}</a>`;
    downloadListUl?.appendChild(liEl);
})

const map  = new Map({
    container: 'map', // container id
    style: 'https://tiles.openfreemap.org/styles/positron',
    bounds: [
        -81.6558837890625,
        40.98819156349393,
        -81.41418457031251,
        41.16624933909198
    ]
});


const mapLookup = {}
const setMap = function (mapid: string) {
    const mapDef = mapLookup[mapid]
    map.fitBounds(mapDef.bounds,{linear:true, padding: {top: 0, bottom:0, left: 350, right: 0}})
    // map.flyTo(mapDef.bounds,{linear:true, padding: {top: 0, bottom:0, left: 200, right: 0}})
    if (map.getStyle().layers.map(a => a.id).includes("overlay")){map.removeLayer("overlay")}
    map.addLayer({
        'id': "overlay",
        'type': 'raster',
        'source': mapid,
    })

    const slider = document.getElementById("transparency-slider") as HTMLInputElement;
    if (slider) {
      slider.value = '100';
      slider.addEventListener('input', function (e) {
          map.setPaintProperty(
              "overlay",
              "raster-opacity",
              parseInt(slider.value, 10) / 100,
          )
      })
    }
}

const panelControls = document.getElementById("panel-controls");
const panelInfo = document.getElementById("panel-info");
const panelDownloads = document.getElementById("panel-downloads");

const btnShowControls = document.getElementById("open-controls");
const btnShowInfo = document.getElementById("show-more");
const btnShowDownloads = document.getElementById("show-downloads");

const btnHideControls = document.getElementById("hide-controls");
const btnHideInfo = document.getElementById("close-panel-info");
const btnHideDownloads = document.getElementById("close-panel-downloads");

btnShowInfo?.addEventListener('click', (e) =>  {
    panelInfo?.classList.toggle("hidden");
    panelDownloads?.classList.add("hidden");
    panelControls?.classList.add("hidden");
})
btnShowDownloads?.addEventListener('click', (e) =>  {
    panelDownloads?.classList.toggle("hidden");
    panelInfo?.classList.add("hidden");
    panelControls?.classList.add("hidden");
})
btnHideControls?.addEventListener('click', (e) =>  {
    panelControls?.classList.add("hidden");
    btnShowControls?.classList.remove("hidden");
    
})
btnHideInfo?.addEventListener('click', (e) =>  {
    panelInfo?.classList.add("hidden");
    panelControls?.classList.remove("hidden");
})
btnHideDownloads?.addEventListener('click', (e) =>  {
    panelDownloads?.classList.add("hidden");
    panelControls?.classList.remove("hidden");
})
btnShowControls?.addEventListener('click', (e) =>  {
    panelControls?.classList.remove("hidden");
    btnShowControls?.classList.add("hidden");
})

map.on('load', () => {
    const mapSelect = document.getElementById("mapSelect")
    const mapSelected = document.getElementById("mapSelected")
    const mapSelectList = document.getElementById("mapSelectList")

    fhaMapData.items.forEach((element, index) => {
        element.type = "raster";
        map.addSource(element.id, element)
        mapLookup[element.id] = element

        const selectOpt = document.createElement('option')
        selectOpt.innerHTML = element.title;
        selectOpt.value = element.id;
        const selectOpt2 = document.createElement('li')
        selectOpt2.innerHTML = `
        <label>
        <input type="radio" name="display-map" value="${element.id}" ${index == 0 ? 'checked' : ''} />
        ${element.title}
        </label>
        </li>`
        mapSelectList?.appendChild(selectOpt2)
        if (index == 0) {mapSelected.textContent = element.title}
    });

    mapSelectList.addEventListener('change', (e) => {
        // e.target refers to the specific radio button that was clicked
        const selectedValue = e.target.value;
        mapSelected.textContent = mapLookup[selectedValue].title;
        setMap(selectedValue);
        mapSelect.open = false;
    });

    setMap(fhaMapData.items[0].id)
});