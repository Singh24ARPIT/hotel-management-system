/**
 * Public runtime configuration.
 *
 * Never put a Supabase service-role key, email password, or other secret in
 * this file. Only the public anon key belongs in browser code.
 */
window.HMS_CONFIG = Object.freeze({
  hotelName: "Hotel Management System",
  hotelLocation: "Pilot property",

  // Shown only when configured.
  supportEmail: "",
  publicReviewUrl: "",

  // Keep true until the Supabase-backed submission function is deployed and
  // tested. Preview mode stores reviews only in this browser.
  demoMode: true,

  supabaseUrl: "",
  supabaseAnonKey: "",
  submitFunction: "submit-review"
});
