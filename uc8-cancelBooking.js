/* =========================================================================
   uc8-cancelBooking.js — Use Case 8: Cancel Booking
   Includes Use Case 7 (View Booking / PNR Status): cancellation is
   triggered from either the PNR Status screen or the My Bookings list,
   so this module is imported by both uc7-pnrStatus.js and uc9-history.js.
========================================================================= */

import { getBooking, saveBooking } from "./storage.js";
import { showToast } from "./utils.js";
import { askConfirm } from "./modal.js";

// `container` is the DOM node holding one or more .cancel-booking-btn
// buttons. `onDone(pnr)` is called after a successful cancellation so the
// caller can refresh its own view (re-run the PNR lookup, or reload history).
export function bindCancelButtons(container, onDone){
  container.querySelectorAll(".cancel-booking-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const pnr = btn.dataset.pnr;
      askConfirm("Cancel this booking?", `PNR ${pnr} will be marked as cancelled. This cannot be undone.`, async () => {
        const record = await getBooking(pnr);

        // Exception: cancelling an already-cancelled or non-existent booking
        if(!record || record.status === "Cancelled"){
          showToast("This booking is already cancelled or no longer exists.");
          return;
        }

        record.status = "Cancelled";
        const ok = await saveBooking(record);
        if(!ok){ showToast("Couldn't cancel the booking. Try again."); return; }

        showToast("Booking cancelled.");
        onDone(pnr);
      });
    });
  });
}
