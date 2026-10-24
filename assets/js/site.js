(function () {
  "use strict";

  const config = window.HMS_CONFIG || {};

  const page = document.body.dataset.page || "site";
  const hotelName = config.hotelName || "Hotel Management System";

  if (page) {
    document.documentElement.dataset.page = page;
  }

  document.querySelectorAll("[data-hotel-name]").forEach((node) => {
    node.textContent = hotelName;
  });

  document.querySelectorAll("[data-hotel-location]").forEach((node) => {
    node.textContent = config.hotelLocation || "Pilot property";
  });

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const demoBanner = document.querySelector("[data-demo-banner]");
  if (demoBanner && config.demoMode) {
    demoBanner.hidden = false;
    demoBanner.innerHTML =
      "<strong>Preview mode.</strong> Feedback is stored only in this browser and is not sent to the hotel yet.";
  }

  document.querySelectorAll("[data-public-review-link]").forEach((node) => {
    if (config.publicReviewUrl) {
      node.href = config.publicReviewUrl;
      node.hidden = false;
    } else {
      node.hidden = true;
    }
  });

  const hasSupportEmail = Boolean(config.supportEmail);
  document.querySelectorAll("[data-support-email]").forEach((node) => {
    if (hasSupportEmail) {
      node.href = `mailto:${config.supportEmail}`;
      node.textContent = config.supportEmail;
      node.hidden = false;
    } else {
      node.hidden = true;
    }
    const wrapper = node.closest("[data-support-wrapper]");
    if (wrapper) wrapper.hidden = !hasSupportEmail;
  });
  document
    .querySelectorAll("[data-support-wrapper-fallback]")
    .forEach((node) => {
      node.hidden = hasSupportEmail;
    });

  const invite = new URLSearchParams(window.location.search).get("invite");
  if (invite) {
    document.querySelectorAll("[data-preserve-invite]").forEach((link) => {
      const url = new URL(link.href, window.location.href);
      url.searchParams.set("invite", invite);
      link.href = url.toString();
    });
  }
})();
