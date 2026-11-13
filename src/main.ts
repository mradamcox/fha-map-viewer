import '@picocss/pico/css/pico.css';
import './style.css'
import type { RasterSourceSpecification } from 'maplibre-gl';
import { Map,  setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

import fhaMapData from "./data/fha-map-data.json"

setWorkerUrl(workerUrl);

const onMobile = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

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
            linear:false, padding: {top: 0, bottom:0, left: onMobile() ? 0 : 350, right: 0}
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
