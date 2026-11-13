import '@picocss/pico/css/pico.css';
import './style.css'
import type { RasterSourceSpecification } from 'maplibre-gl';
import { Map,  setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

import fhaMapData from "./data/fha-map-data.json"

setWorkerUrl(workerUrl);

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

interface MapItem {
    title: string;
    id: string;
    source: RasterSourceSpecification;
    center?: [number, number, number];
}

const maps = fhaMapData.items as MapItem[];

const downloadListUl = document.getElementById("download-list")
maps.sort(function(a, b) {
    return a.title.localeCompare(b.title);
});
maps.map(item => {
    const liEl = document.createElement("li");
    liEl.innerHTML = `<strong>${item.title}</strong><br/>[<a href="${item.id}">geotiff</a>] [<a href="${item.id}">jpg</a>]`;
    downloadListUl?.appendChild(liEl);
})

const map  = new Map({
    container: 'map', // container id
    style: 'https://tiles.openfreemap.org/styles/positron',
    bounds: maps[0].source.bounds
});

const slider = document.getElementById("transparency-slider") as HTMLInputElement;
const mapLookup: Record<string, MapItem> = {}

const setMap = function (mapid: string) {
    const mapDef = mapLookup[mapid]
    if (mapDef.source.bounds) {
        map.fitBounds(mapDef.source.bounds,{
            linear:false, padding: {top: 0, bottom:0, left: isMobile ? 0 : 350, right: 0}
        })
    }

    if (map.getStyle().layers.map(a => a.id).includes("overlay")){map.removeLayer("overlay")}

    if (mapDef.source.tiles) {
        map.addLayer({
            'id': "overlay",
            'type': 'raster',
            'source': mapid,
        })
    }

    if (slider) {
      slider.value = '100';
      slider.addEventListener('input', function () {
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

btnShowInfo?.addEventListener('click', () =>  {
    panelInfo?.classList.toggle("hidden");
    panelDownloads?.classList.add("hidden");
    panelControls?.classList.add("hidden");
})
btnShowDownloads?.addEventListener('click', () =>  {
    panelDownloads?.classList.toggle("hidden");
    panelInfo?.classList.add("hidden");
    panelControls?.classList.add("hidden");
})
btnHideControls?.addEventListener('click', () =>  {
    panelControls?.classList.add("hidden");
    btnShowControls?.classList.remove("hidden");
    
})
btnHideInfo?.addEventListener('click', () =>  {
    panelInfo?.classList.add("hidden");
    panelControls?.classList.remove("hidden");
})
btnHideDownloads?.addEventListener('click', () =>  {
    panelDownloads?.classList.add("hidden");
    panelControls?.classList.remove("hidden");
})
btnShowControls?.addEventListener('click', () =>  {
    panelControls?.classList.remove("hidden");
    btnShowControls?.classList.add("hidden");
})


const mapSelect = document.getElementById("mapSelect") as HTMLDetailsElement;
const mapSelected = document.getElementById("mapSelected")
const mapSelectList = document.getElementById("mapSelectList") as HTMLUListElement;

maps.forEach((element, index) => {
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
    if (index == 0 && mapSelected) {mapSelected.textContent = element.title}
});

map.on('load', () => {

    maps.forEach((item) => {
        if (item.source.tiles) {
            map.addSource(item.id, item.source)
        }
});
    mapSelectList?.addEventListener('change', (e: Event) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement ) {
            const selectedValue = e.target.value;
            if (mapSelected) {
                mapSelected.textContent = mapLookup[selectedValue].title;
                setMap(selectedValue);
                if (mapSelect) {mapSelect.open = false};
            }
        }
    });

    setMap(maps[0].id)
});
