/* =========================================================================
   uc7-pnrStatus.js — Use Case 7: View Booking / PNR Status
   Passenger enters a PNR; the system looks up the booking and shows its
   details and current status. Also wires up Use Case 8 (Cancel Booking)
   for the ticket that's found.
========================================================================= */

import { getBooking } from "./storage.js";
import { bannerHtml } from "./utils.js";
import { ticketCard } from "./ticketView.js";
import { bindCancelButtons } from "./uc8-cancelBooking.js";

export function renderStatusPanel(){
  document.getElementById("status-banner").innerHTML = "";
  document.getElementById("pnr-input").value = "";
  document.getElementById("status-result").innerHTML = "";

  const btn = document.getElementById("pnr-lookup-btn");
  btn.onclick = doLookup;
  document.getElementById("pnr-input").onkeydown = (e) => { if(e.key === "Enter") doLookup(); };
}

async function doLookup(){
  const pnr = document.getElementById("pnr-input").value.trim();
  const banner = document.getElementById("status-banner");
  const resultBox = document.getElementById("status-result");
  banner.innerHTML = ""; resultBox.innerHTML = "";

  if(!/^\d{10}$/.test(pnr)){
    banner.innerHTML = bannerHtml("err","Enter a valid 10-digit PNR.");
    return;
  }

  banner.innerHTML = bannerHtml("info","Looking up booking…");
  const record = await getBooking(pnr);

  // Exception: invalid PNR
  if(!record){
    banner.innerHTML = bannerHtml("err","No booking found for this PNR.");
    return;
  }

  banner.innerHTML = "";
  resultBox.innerHTML = ticketCard(record, { showCancel:true });
  bindCancelButtons(resultBox, () => doLookup());
}
