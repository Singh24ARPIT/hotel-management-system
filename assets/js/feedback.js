import { submitReview } from "./review-store.js";

const form = document.getElementById("review-form");
const errorSummary = document.getElementById("form-error");
const submitButton = document.getElementById("submit-button");
const comment = document.getElementById("comment");
const commentLength = document.querySelector("[data-comment-length]");
const contactDetails = document.getElementById("contact-details");
const guestName = document.getElementById("guest-name");
const guestEmail = document.getElementById("guest-email");
const guestPhone = document.getElementById("guest-phone");
const contactConsent = document.getElementById("contact-consent");
const contactError = document.getElementById("contact-error");

const ratingNames = [
  "overall",
  "cleanliness",
  "service",
  "comfort",
  "food",
  "value"
];

const starPath =
  "m12 2.7 2.9 5.8 6.4.9-4.6 4.5 1.1 6.4-5.8-3-5.8 3 1.1-6.4-4.6-4.5 6.4-.9L12 2.7Z";

function starSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", starPath);
  svg.append(path);
  return svg;
}

function createRatingControl(container) {
  const name = container.dataset.ratingName;
  const labelText = container.dataset.ratingLabel;
  const isRequired = container.dataset.required === "true";
  const labelId = `${name}-label`;
  const hintId = `${name}-hint`;

  const group = document.createElement("div");
  group.className = "rating-group";
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-labelledby", labelId);
  group.setAttribute("aria-describedby", hintId);
  group.dataset.ratingGroup = name;

  const heading = document.createElement("div");
  heading.className = "rating-group__heading";

  const label = document.createElement("span");
  label.className = "field-label";
  label.id = labelId;
  label.textContent = labelText;
  if (isRequired) {
    const required = document.createElement("span");
    required.className = "required-mark";
    required.textContent = " *";
    required.setAttribute("aria-hidden", "true");
    label.append(required);
    const screenReaderRequired = document.createElement("span");
    screenReaderRequired.className = "visually-hidden";
    screenReaderRequired.textContent = " (required)";
    label.append(screenReaderRequired);
  }

  if (!isRequired) {
    const optional = document.createElement("span");
    optional.className = "rating-group__optional";
    optional.textContent = "Optional";
    heading.append(label, optional);
  } else {
    heading.append(label);
  }

  const starInput = document.createElement("div");
  starInput.className = "star-input";

  for (let value = 5; value >= 1; value -= 1) {
    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.id = `${name}-${value}`;
    input.value = String(value);
    input.required = isRequired;
    input.setAttribute(
      "aria-label",
      `${value} out of 5 for ${labelText}`
    );

    const starLabel = document.createElement("label");
    starLabel.htmlFor = input.id;
    starLabel.title = `${value} out of 5`;
    starLabel.append(starSvg());

    input.addEventListener("change", () => {
      hint.textContent = `${value} out of 5 selected`;
      hint.classList.remove("field-error");
      group.classList.remove("rating-group--invalid");
    });

    starInput.append(input, starLabel);
  }

  const hint = document.createElement("p");
  hint.className = "rating-group__hint";
  hint.id = hintId;
  hint.textContent = isRequired ? "Select a rating" : "Not rated";

  group.append(heading, starInput, hint);
  container.replaceWith(group);
}

document.querySelectorAll(".rating-control").forEach(createRatingControl);

comment?.addEventListener("input", () => {
  commentLength.textContent = String(comment.value.length);
});

function getRating(name) {
  const selected = form.querySelector(`input[name="${name}"]:checked`);
  return selected ? Number(selected.value) : null;
}

function hasContactDetails() {
  return Boolean(
    guestName.value.trim() || guestEmail.value.trim() || guestPhone.value.trim()
  );
}

function clearErrors() {
  errorSummary.hidden = true;
  errorSummary.textContent = "";
  contactError.hidden = true;
  form.querySelectorAll(".rating-group--invalid").forEach((group) => {
    group.classList.remove("rating-group--invalid");
  });
  form.querySelectorAll(".field--invalid").forEach((field) => {
    field.classList.remove("field--invalid");
  });
}

function showError(message, target) {
  errorSummary.hidden = false;
  errorSummary.textContent = message;
  if (target) {
    target.classList.add(
      target.classList.contains("rating-group")
        ? "rating-group--invalid"
        : "field--invalid"
    );
  }
  errorSummary.focus({ preventScroll: false });
  errorSummary.scrollIntoView({ behavior: "smooth", block: "center" });
}

function validateEmail() {
  if (!guestEmail.value.trim()) return true;
  return guestEmail.validity.valid;
}

function setSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.setAttribute("aria-busy", String(isSubmitting));
  submitButton.textContent = isSubmitting ? "Sending your feedback…" : "Send feedback";
  if (!isSubmitting) {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("class", "btn__icon");
    icon.setAttribute("viewBox", "0 0 20 20");
    icon.setAttribute("fill", "none");
    icon.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M4 10h12M11 5l5 5-5 5");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    icon.append(path);
    submitButton.append(icon);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const overall = getRating("overall");

  if (!overall) {
    const overallGroup = form.querySelector('[data-rating-group="overall"]');
    showError("Please choose an overall rating before sending.", overallGroup);
    return;
  }

  if (!validateEmail()) {
    contactDetails.open = true;
    showError("Please enter a valid email address, or leave it blank.", guestEmail.closest(".field"));
    guestEmail.focus();
    return;
  }

  if (hasContactDetails() && !contactConsent.checked) {
    contactDetails.open = true;
    contactError.hidden = false;
    showError(
      "Please agree to be contacted, or remove your contact details.",
      contactConsent.closest(".checkbox-row")
    );
    contactConsent.focus();
    return;
  }

  const withConsent = contactConsent.checked && hasContactDetails();
  const invite = new URLSearchParams(window.location.search).get("invite");

  const payload = {
    inviteCode: invite || null,
    ratings: {
      overall,
      cleanliness: getRating("cleanliness"),
      service: getRating("service"),
      comfort: getRating("comfort"),
      food: getRating("food"),
      value: getRating("value")
    },
    recommend: form.querySelector('input[name="recommend"]:checked')?.value || null,
    comment: comment.value.trim(),
    contact: withConsent
      ? {
          name: guestName.value.trim() || null,
          email: guestEmail.value.trim() || null,
          phone: guestPhone.value.trim() || null
        }
      : null,
    contactConsent: withConsent,
    locale: document.documentElement.lang || "en"
  };

  setSubmitting(true);

  try {
    const result = await submitReview(payload);
    const destination = new URL("thank-you.html", window.location.href);
    destination.searchParams.set("ref", result.reference);
    destination.searchParams.set("rating", String(overall));
    window.location.assign(destination.toString());
  } catch (error) {
    showError(
      error.message || "We could not send your feedback. Please try again.",
      null
    );
    setSubmitting(false);
  }
});

window.addEventListener("pageshow", () => {
  if (submitButton.disabled) setSubmitting(false);
});
