/* =========================================================================
   uc4-passengers.js — Use Case 4: Enter Passenger Details
   (Multi-Passenger Booking)
   Passenger adds/removes co-passengers and fills name, age, gender and
   berth preference for each. Business rule: up to MAX_PASSENGERS per
   booking. Validates before moving on to Make Payment (Use Case 5).
========================================================================= */

import { state, blankPassenger } from "./state.js";
import { CLASS_LABELS, MAX_PASSENGERS, BERTH_OPTIONS } from "./data.js";
import { escapeHtml, bannerHtml } from "./utils.js";
import { render } from "./renderer.js";

export function tplPassengers(){
  const t = state.selectedTrain, cls = state.selectedClass;
  const rows = state.passengers.map((p, i) => `
    <div class="pax-row">
      ${state.passengers.length > 1 ? `<button class="pax-remove" data-idx="${i}" title="Remove traveller">✕ Remove</button>` : ""}
      <div class="pax-tag">TRAVELLER ${i+1}</div>
      <div class="field-grid">
        <div class="field"><label>Full Name</label>
          <input type="text" data-idx="${i}" data-field="name" value="${escapeHtml(p.name)}" placeholder="As per ID proof">
        </div>
        <div class="field"><label>Age</label>
          <input type="number" min="1" max="120" data-idx="${i}" data-field="age" value="${escapeHtml(p.age)}" placeholder="Age">
        </div>
        <div class="field"><label>Gender</label>
          <select data-idx="${i}" data-field="gender">
            <option value="">Select</option>
            <option ${p.gender==="Female"?"selected":""}>Female</option>
            <option ${p.gender==="Male"?"selected":""}>Male</option>
            <option ${p.gender==="Other"?"selected":""}>Other</option>
          </select>
        </div>
        <div class="field"><label>Berth Preference</label>
          <select data-idx="${i}" data-field="berth">
            ${BERTH_OPTIONS.map(b => `<option ${p.berth===b?"selected":""}>${b}</option>`).join("")}
          </select>
        </div>
      </div>
    </div>`).join("");

  return `
  <div class="card">
    <h2>Passenger Details</h2>
    <p class="subtext">${t.name} (${t.number}) · ${CLASS_LABELS[cls]} · ${escapeHtml(state.searchCriteria.source)} → ${escapeHtml(state.searchCriteria.destination)}</p>
    <div id="pax-error"></div>
    ${rows}
    <div class="btn-row">
      <button class="btn btn-ghost btn-sm" id="add-pax-btn" ${state.passengers.length >= MAX_PASSENGERS ? "disabled" : ""}>+ Add Traveller</button>
    </div>
    <p class="subtext" style="margin-top:6px;">Up to ${MAX_PASSENGERS} travellers per booking.</p>
    <div class="btn-row">
      <button class="btn btn-ghost" id="back-to-results">Back</button>
      <button class="btn btn-primary" id="continue-to-payment-btn">Review &amp; Pay</button>
    </div>
  </div>`;
}

function validatePassengers(){
  for(const p of state.passengers){
    if(!p.name.trim()) return "Every traveller needs a full name.";
    const age = Number(p.age);
    if(!p.age || isNaN(age) || age < 1 || age > 120) return "Enter a valid age (1–120) for every traveller.";
    if(!p.gender) return "Select a gender for every traveller.";
    if(!p.berth) return "Select a berth preference for every traveller.";
  }
  return null;
}

export function bindPassengerEvents(){
  const addBtn = document.getElementById("add-pax-btn");
  if(addBtn) addBtn.addEventListener("click", () => {
    if(state.passengers.length < MAX_PASSENGERS){ state.passengers.push(blankPassenger()); render(); }
  });

  document.querySelectorAll(".pax-remove").forEach(btn => {
    btn.addEventListener("click", () => { state.passengers.splice(Number(btn.dataset.idx),1); render(); });
  });

  document.querySelectorAll("#book-content [data-field]").forEach(inp => {
    inp.addEventListener("input", () => {
      state.passengers[Number(inp.dataset.idx)][inp.dataset.field] = inp.value;
    });
  });

  const backBtn = document.getElementById("back-to-results");
  if(backBtn) backBtn.addEventListener("click", () => { state.bookStep = 2; render(); });

  const continueBtn = document.getElementById("continue-to-payment-btn");
  if(continueBtn) continueBtn.addEventListener("click", () => {
    const err = validatePassengers();
    const box = document.getElementById("pax-error");
    if(err){ box.innerHTML = bannerHtml("err", err); return; }
    box.innerHTML = "";
    state.bookStep = 4;
    render();
  });
}
