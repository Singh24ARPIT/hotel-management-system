# Hotel Management System

A guest feedback and review-triage application for a single-property hotel pilot.

**Live preview:** <https://singh24arpit.github.io/hotel-management-system/>

The guest-facing experience is built with plain HTML, CSS, and JavaScript. Reviews are intended to be stored in a managed Supabase Postgres database, with staff authentication, row-level security, and a server-side submission function. A small machine-learning model will help staff identify negative reviews and recurring service issues. The model is advisory only; hotel staff make the final decision.

> **Current status:** guest-facing preview. The application currently runs in local preview mode and does not yet persist reviews to a live database. The ML pipeline and staff dashboard are being added after the verified review dataset and Supabase project are available.

## Pages

- `index.html` — welcome, explanation, and browser text-to-speech
- `feedback.html` — structured ratings and free-text feedback
- `thank-you.html` — confirmation, reference number, and text-to-speech
- Staff dashboard, authentication, and invite management are planned.

## Run locally

No build step is required.

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Repository safety

Guest reviews, names, email addresses, phone numbers, datasets, and credentials are never committed to this public repository. The supplied legacy RateMyHotel data includes personally identifiable information and must remain outside this project.

The Supabase anon key is safe to expose in a browser only when row-level security policies are correctly configured. The service-role key must never be placed in frontend code or committed.

## Planned architecture

- **Frontend:** HTML5, CSS3, and vanilla JavaScript
- **Database and auth:** Supabase Postgres, Supabase Auth, row-level security
- **Guest submission:** Supabase Edge Function with one-time invite validation and rate limiting
- **ML training:** Python, run offline
- **ML inference:** exported model artifacts served from the submission function
- **TTS:** Web Speech API

## Text-to-speech

TTS is explicitly user-initiated. It is not autoplayed. The controls are removed or disabled when the browser does not support the Web Speech API, and all essential content remains available as text.
