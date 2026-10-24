import { bindTtsButton } from "./tts.js";

const script = document.getElementById("welcome-script");
const button = document.querySelector("[data-tts-button]");

bindTtsButton(button, () => script?.textContent || "");
