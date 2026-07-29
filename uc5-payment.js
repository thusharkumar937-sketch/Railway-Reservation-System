/* =========================================================================
   uc5-payment.js — Use Case 5: Make Payment
   Passenger reviews the fare summary and pays through a simulated
   Payment Gateway (Mock). On success, hands off to Use Case 6
   (Generate PNR) via confirmBooking() in uc6-generatePnr.js.
   Exception: payment failure — the mock gateway can decline a card.
========================================================================= */

import { state } from "./state.js";
import { CLASS_LABELS } from "./data.js";
import { escapeHtml, formatINR, bannerHtml } from "./utils.js";
import { render } from "./renderer.js";
import { confirmBooking } from "./uc6-generatePnr.js";

export function tplPayment(){
  const t = state.selectedTrain, cls = state.selectedClass;
  const base = t.fare[cls] * state.passengers.length;
  const convenience = 20;
  state.fareTotal = base + convenience;

  return `
  <div class="card">
    <h2>Booking Summary</h2>
    <div class="ticket-row"><span>Train</span><span>${t.name} (${t.number})</span></div>
    <div class="ticket-row"><span>Route</span><span>${escapeHtml(state.searchCriteria.source)} → ${escapeHtml(state.searchCriteria.destination)}</span></div>
    <div class="ticket-row"><span>Class</span><span>${CLASS_LABELS[cls]}</span></div>
    <div class="ticket-row"><span>Travellers</span><span>${state.passengers.length}</span></div>
    <div class="ticket-row"><span>Base Fare</span><span>${formatINR(base)}</span></div>
    <div class="ticket-row"><span>Convenience Fee</span><span>${formatINR(convenience)}</span></div>
    <div class="ticket-row" style="font-weight:700; border-bottom:none;"><span>Total</span><span>${formatINR(state.fareTotal)}</span></div>
  </div>

  <div class="card">
    <h2>Payment</h2>
    <p class="subtext">Payment Gateway (Mock) — no real transaction occurs.</p>
    <div id="payment-error"></div>
    <div class="field" style="max-width:280px;">
      <label>Payment Method</label>
      <select id="pay-method">
        <option value="upi" ${state.paymentMethod==="upi"?"selected":""}>UPI</option>
        <option value="card" ${state.paymentMethod==="card"?"selected":""}>Debit / Credit Card</option>
        <option value="netbanking" ${state.paymentMethod==="netbanking"?"selected":""}>Net Banking</option>
      </select>
    </div>
    <div id="pay-method-fields"></div>
    <div class="btn-row">
      <button class="btn btn-ghost" id="back-to-passengers">Back</button>
      <button class="btn btn-primary" id="pay-btn">Pay ${formatINR(state.fareTotal)}</button>
    </div>
    <p class="subtext" style="margin-top:10px;">Test tip: any card number succeeds, except <span class="mono">4000000000000002</span> which simulates a decline.</p>
  </div>`;
}

function renderPaymentMethodFields(){
  const wrap = document.getElementById("pay-method-fields");
  if(!wrap) return;
  const method = document.getElementById("pay-method").value;
  state.paymentMethod = method;
  if(method === "card"){
    wrap.innerHTML = `
    <div class="field-grid">
      <div class="field"><label>Card Number</label><input type="text" id="card-number" class="mono" maxlength="16" placeholder="16-digit card number"></div>
      <div class="field"><label>Name on Card</label><input type="text" id="card-name" placeholder="As printed on card"></div>
      <div class="field"><label>Expiry</label><input type="text" id="card-expiry" placeholder="MM/YY" maxlength="5"></div>
      <div class="field"><label>CVV</label><input type="password" id="card-cvv" maxlength="3" placeholder="•••"></div>
    </div>`;
  } else if(method === "upi"){
    wrap.innerHTML = `<div class="field" style="max-width:280px;"><label>UPI ID</label><input type="text" id="upi-id" placeholder="yourname@upi"></div>`;
  } else {
    wrap.innerHTML = `<div class="field" style="max-width:280px;"><label>Bank</label>
      <select id="bank-select"><option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option></select></div>`;
  }
}

function handlePay(){
  const errBox = document.getElementById("payment-error");
  errBox.innerHTML = "";
  const method = state.paymentMethod;

  if(method === "card"){
    const num = document.getElementById("card-number").value.trim();
    const name = document.getElementById("card-name").value.trim();
    const expiry = document.getElementById("card-expiry").value.trim();
    const cvv = document.getElementById("card-cvv").value.trim();
    if(num.length < 12 || !name || expiry.length < 4 || cvv.length < 3){
      errBox.innerHTML = bannerHtml("err","Please fill in all card details correctly.");
      return;
    }
    processPayment(num === "4000000000000002" ? "decline" : "success");
  } else if(method === "upi"){
    const upi = document.getElementById("upi-id").value.trim();
    if(!upi.includes("@")){ errBox.innerHTML = bannerHtml("err","Enter a valid UPI ID."); return; }
    processPayment("success");
  } else {
    processPayment("success");
  }
}

function processPayment(outcome){
  const btn = document.getElementById("pay-btn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Processing…`;
  setTimeout(async () => {
    if(outcome === "decline"){
      document.getElementById("payment-error").innerHTML = bannerHtml("err","Payment declined by the bank. Please try another card or method.");
      btn.disabled = false;
      btn.textContent = `Pay ${formatINR(state.fareTotal)}`;
      return;
    }
    await confirmBooking();
  }, 1200);
}

export function bindPaymentEvents(){
  const methodSelect = document.getElementById("pay-method");
  if(methodSelect) methodSelect.addEventListener("change", renderPaymentMethodFields);
  renderPaymentMethodFields();

  const backBtn = document.getElementById("back-to-passengers");
  if(backBtn) backBtn.addEventListener("click", () => { state.bookStep = 3; render(); });

  const payBtn = document.getElementById("pay-btn");
  if(payBtn) payBtn.addEventListener("click", handlePay);
}
