
import { state, blankPassenger } from "./state.js";
import { TRAINS } from "./data.js";
import { showToast } from "./utils.js";
import { render } from "./renderer.js";

function selectClass(trainNumber, cls){
  const train = TRAINS.find(t => t.number === trainNumber);
  const info = train.classes[cls];
  const info = train.classes[cls];

  
  const available = info.total - info.booked;
  if(available <= 0){
    showToast("That class just became unavailable. Please choose another.");
    console.log("Seats are full choose another coach");
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
