/* =========================================================================
   uc3-selectClass.js — Use Case 3: Select Train and Travel Class
   Includes Use Case 2 (Check Seat Availability): the passenger can only
   select a class once availability has been shown. Carries the chosen
   train/class forward into the passenger details step (Use Case 4).
========================================================================= */

import { state, blankPassenger } from "./state.js";
import { TRAINS } from "./data.js";
import { showToast } from "./utils.js";
import { render } from "./renderer.js";

function selectClass(trainNumber, cls){
  const train = TRAINS.find(t => t.number === trainNumber);
  const info = train.classes[cls];

  // Exception: the selected class becomes unavailable before confirmation.
  // In this mock system availability doesn't change mid-session, but the
  // check is kept here so the exception path is easy to demo/extend.
  const available = info.total - info.booked;
  if(available <= 0){
    showToast("That class just became unavailable. Please choose another.");
    return;
  }

  state.selectedTrain = train;
  state.selectedClass = cls;
  state.passengers = [ blankPassenger() ];
  state.bookStep = 3;
  render();
}

export function bindSelectClassEvents(){
  document.querySelectorAll(".select-class-btn").forEach(btn => {
    btn.addEventListener("click", () => selectClass(btn.dataset.train, btn.dataset.class));
  });
}
