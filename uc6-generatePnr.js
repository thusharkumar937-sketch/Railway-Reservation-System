/* =========================================================================
   uc6-generatePnr.js — Use Case 6: Generate PNR
   Includes Use Case 5 (Make Payment): runs immediately after payment
   succeeds. Generates a unique PNR, saves the booking, and shows the
   confirmation screen.
========================================================================= */

import { state, resetBookingFlow } from "./state.js";
import { generatePNR, showToast } from "./utils.js";
import { saveBooking, getBooking } from "./storage.js";
import { ticketCard } from "./ticketView.js";
import { render } from "./renderer.js";

export async function confirmBooking(){
  // Business rule: each PNR must be unique across all bookings.
  let pnr = generatePNR();
  let existing = await getBooking(pnr);
  while(existing){ pnr = generatePNR(); existing = await getBooking(pnr); }

  const record = {
    pnr,
    trainNumber: state.selectedTrain.number,
    trainName: state.selectedTrain.name,
    source: state.searchCriteria.source,
    destination: state.searchCriteria.destination,
    date: state.searchCriteria.date,
    class: state.selectedClass,
    passengers: state.passengers.map(p => ({...p})),
    fare: state.fareTotal,
    status: "Confirmed",
    bookedAt: Date.now()
  };

  const saved = await saveBooking(record);
  if(!saved){
    // Exception: PNR generation / save failure — let the passenger retry.
    showToast("Payment succeeded but we couldn't save your booking. Please try again.");
    return;
  }
  state.lastBooking = record;
  state.bookStep = 5;
  render();
}

export function tplConfirmation(){
  const b = state.lastBooking;
  return `
  <div class="banner ok">Payment successful — your ticket is booked.</div>
  ${ticketCard(b)}
  <div class="btn-row">
    <button class="btn btn-primary" id="book-another-btn">Book Another Ticket</button>
    <button class="btn btn-ghost" id="goto-history-btn">View My Bookings</button>
  </div>`;
}

export function bindConfirmationEvents(){
  const bookAnotherBtn = document.getElementById("book-another-btn");
  if(bookAnotherBtn) bookAnotherBtn.addEventListener("click", () => { resetBookingFlow(); render(); });

  const gotoHistoryBtn = document.getElementById("goto-history-btn");
  if(gotoHistoryBtn) gotoHistoryBtn.addEventListener("click", () => {
    resetBookingFlow();
    state.screen = "history";
    render();
  });
}
