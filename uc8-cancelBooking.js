

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
