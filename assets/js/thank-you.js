import { bindTtsButton } from "./tts.js";

const params = new URLSearchParams(window.location.search);
const rawReference = params.get("ref") || "";
const reference = rawReference.replace(/[^\w-]/g, "").slice(0, 40);
const rawRating = Number(params.get("rating"));
const rating =
  Number.isInteger(rawRating) && rawRating >= 1 && rawRating <= 5
    ? rawRating
    : null;

const referenceBox = document.getElementById("reference-box");
const referenceValue = document.getElementById("reference-value");
const thanksRating = document.getElementById("thanks-rating");
const starsContainer = document.getElementById("thanks-rating-stars");
const ratingText = document.getElementById("thanks-rating-text");
const followUpNote = document.getElementById("follow-up-note");

if (reference) {
  referenceValue.textContent = reference;
  referenceBox.hidden = false;
}

function starIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "m12 2.7 2.9 5.8 6.4.9-4.6 4.5 1.1 6.4-5.8-3-5.8 3 1.1-6.4-4.6-4.5 6.4-.9L12 2.7Z");
  svg.append(path);
  return svg;
}

if (rating) {
  for (let index = 0; index < rating; index += 1) {
    starsContainer.append(starIcon());
  }
  ratingText.textContent = `${rating} out of 5`;
  thanksRating.hidden = false;
}

if (!reference) {
  followUpNote.textContent =
    "If you asked us to follow up, a member of the team will be in touch using the contact details you provided.";
}

const speechParts = [
  "Thank you for sharing your feedback. The hotel team will read your response and use it to improve future stays."
];

if (reference) {
  speechParts.push(
    `Your reference number is ${reference.replace(/-/g, ", ")}.`
  );
}

if (rating) {
  speechParts.push(`You rated your overall stay ${rating} out of 5.`);
}

speechParts.push(
  "If you asked us to contact you, a team member will follow up."
);

bindTtsButton(document.getElementById("thank-you-tts"), () =>
  speechParts.join(" ")
);
