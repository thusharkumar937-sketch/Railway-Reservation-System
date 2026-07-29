/* =========================================================================
   uc9-history.js — Use Case 9: View Booking History
   Lists every booking made by the passenger. Also wires up Use Case 8
   (Cancel Booking) for each ticket in the list, plus a "clear all"
   utility to reset stored data while testing.
========================================================================= */

import { listBookings, clearAllBookings } from "./storage.js";
import { showToast } from "./utils.js";
import { askConfirm } from "./modal.js";
import { ticketCard } from "./ticketView.js";
import { bindCancelButtons } from "./uc8-cancelBooking.js";

export async function renderHistoryPanel(){
  const box = document.getElementById("history-list");
  box.innerHTML = `<div class="card"><p class="subtext">Loading your bookings…</p></div>`;

  const bookings = await listBookings();

  // Exception: no bookings found
  if(bookings.length === 0){
    box.innerHTML = `<div class="card"><div class="empty-state"><div class="icon">🎫</div><h3>No bookings yet</h3><p class="subtext">Book a ticket to see it appear here.</p></div></div>`;
  } else {
    box.innerHTML = bookings.map(b => ticketCard(b, { showCancel:true })).join("");
    bindCancelButtons(box, () => renderHistoryPanel());
  }

  const clearBtn = document.getElementById("clear-all-btn");
  clearBtn.onclick = () => {
    askConfirm("Clear all bookings?", "This removes every booking stored in this browser. This cannot be undone.", async () => {
      const ok = await clearAllBookings();
      showToast(ok ? "All bookings cleared." : "Couldn't clear bookings. Try again.");
      renderHistoryPanel();
    });
  };
}
