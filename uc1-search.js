

import { state } from "./state.js";
import { TRAINS, STATIONS } from "./data.js";
import { escapeHtml, todayISO, bannerHtml } from "./utils.js";
import { render } from "./renderer.js";

export function tplSearch(){
  const c = state.searchCriteria || {};
  return `
  <div class="card">
    <h2>Search Trains</h2>
    <p class="subtext">Enter source, destination and date of journey.</p>
    <div id="search-error"></div>
    <div class="card">
    <h2>Search Trains</h2>
    <p class="subtext">Enter source, destination and date of journey.</p>
    <div id="search-error"></div>
    <div class="field-grid">
      <div class="field"><label>Source Station</label>
        <input list="station-list" id="src-input" value="${escapeHtml(c.source||"")}" placeholder="e.g. Chennai Central">
      </div>
      <div class="field"><label>Destination Station</label>
        <input list="station-list" id="dst-input" value="${escapeHtml(c.destination||"")}" placeholder="e.g. KSR Bengaluru">
      </div>
    </div>
    <div class="field" style="max-width:220px;">
      <label>Date of Journey</label>
      <input type="date" id="date-input" min="${todayISO()}" value="${c.date||todayISO()}">
    </div>
    <datalist id="station-list">${STATIONS.map(s=>`<option value="${escapeHtml(s)}">`).join("")}</datalist>
    <div class="btn-row"><button class="btn btn-primary" id="search-btn">Search Trains</button></div>
  </div>`;
}

function doSearch(){
  const source = document.getElementById("src-input").value.trim();
  const destination = document.getElementById("dst-input").value.trim();
  const date = document.getElementById("date-input").value;
  const errBox = document.getElementById("search-error");
  errBox.innerHTML = "";

  // Business rule: source and destination must not be the same
  if(source && destination && source.toLowerCase() === destination.toLowerCase()){
    errBox.innerHTML = bannerHtml("err","Source and destination cannot be the same station.");
    return;
  }
  // Exception: invalid / unrecognized station name
  const validSource = STATIONS.find(s => s.toLowerCase() === source.toLowerCase());
  const validDest = STATIONS.find(s => s.toLowerCase() === destination.toLowerCase());
  if(!source || !validSource){
    errBox.innerHTML = bannerHtml("err", `Station "${escapeHtml(source||"")}" was not recognized. Pick one from the suggestions.`);
    return;
  }
  if(!destination || !validDest){
    errBox.innerHTML = bannerHtml("err", `Station "${escapeHtml(destination||"")}" was not recognized. Pick one from the suggestions.`);
    return;
  }
  if(!date){
    errBox.innerHTML = bannerHtml("err","Please choose a date of journey.");
    return;
  }

  const results = TRAINS.filter(t => t.source === validSource && t.destination === validDest);
  state.searchCriteria = { source: validSource, destination: validDest, date };
  state.searchResults = results;
  state.bookStep = 2;
  render();
}

export function bindSearchEvents(){
  const btn = document.getElementById("search-btn");
  if(btn) btn.addEventListener("click", doSearch);
}
