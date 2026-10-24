/**
 * Small, dependency-free text-to-speech wrapper around the Web Speech API.
 * Speech is always started by an explicit user action.
 */

let preferredVoice = null;
let activeUtterance = null;

export function supportsSpeech() {
  return (
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

function pickVoice() {
  if (!supportsSpeech()) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  return (
    voices.find((voice) => voice.lang === "en-IN") ||
    voices.find((voice) => voice.lang === "en-GB") ||
    voices.find((voice) => voice.lang === "en-US") ||
    voices.find((voice) => voice.lang?.startsWith("en")) ||
    voices[0] ||
    null
  );
}

function loadVoices() {
  if (!supportsSpeech()) return;
  preferredVoice = pickVoice();
}

if (supportsSpeech()) {
  loadVoices();
  window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
}

export function stopSpeech() {
  if (!supportsSpeech()) return;
  window.speechSynthesis.cancel();
  activeUtterance = null;
  document.querySelectorAll("[data-tts-button]").forEach((button) => {
    setButtonState(button, false);
  });
}

function setButtonState(button, isSpeaking) {
  button.setAttribute("aria-pressed", String(isSpeaking));
  const label = button.querySelector("[data-tts-label]");
  if (label) {
    label.textContent = isSpeaking
      ? "Stop reading"
      : button.dataset.ttsDefaultLabel || "Listen";
  }
}

function announce(message) {
  const region = document.getElementById("tts-status");
  if (region) region.textContent = message;
}

/**
 * @param {HTMLButtonElement} button
 * @param {() => string} getText
 */
export function bindTtsButton(button, getText) {
  if (!button) return;

  if (!supportsSpeech()) {
    button.hidden = true;
    return;
  }

  button.hidden = false;
  button.dataset.ttsDefaultLabel =
    button.dataset.ttsDefaultLabel ||
    button.querySelector("[data-tts-label]")?.textContent ||
    "Listen";

  button.addEventListener("click", () => {
    const isCurrentlySpeaking =
      window.speechSynthesis.speaking ||
      window.speechSynthesis.pending;

    if (isCurrentlySpeaking) {
      stopSpeech();
      announce("Reading stopped.");
      return;
    }

    const text = String(getText() || "").trim();
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = "en-IN";
    }

    utterance.rate = 0.94;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.addEventListener("start", () => {
      setButtonState(button, true);
      announce("Reading aloud. Activate the same button to stop.");
    });

    utterance.addEventListener("end", () => {
      if (activeUtterance === utterance) activeUtterance = null;
      setButtonState(button, false);
      announce("Reading finished.");
    });

    utterance.addEventListener("error", (event) => {
      if (event.error === "canceled" || event.error === "interrupted") {
        return;
      }
      setButtonState(button, false);
      announce("The read-aloud feature is unavailable right now.");
    });

    window.speechSynthesis.speak(utterance);
  });
}

window.addEventListener("pagehide", () => {
  if (supportsSpeech()) window.speechSynthesis.cancel();
});
