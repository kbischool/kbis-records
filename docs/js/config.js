/* =========================================================================
   KBIS Schools — configuration
   -------------------------------------------------------------------------
   ACCESS_HASH gates the app behind a shared passphrase for you + staff.
   IMPORTANT: this is a client-side deterrent, not real security — this is a
   public static site, so anyone with the URL *and* the correct passphrase
   can view it, but the source code (incl. this hash) is technically visible
   to anyone who opens dev tools. Don't put anything here you wouldn't want
   a determined visitor to eventually see. See README.md for details.

   To set your own passphrase:
     1. Open this site in a browser, open the JS console, and run:
          await crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourPassphrase'))
            .then(b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join(''))
     2. Copy the printed string into ACCESS_HASH below.
   Default passphrase is:  kbis2026
   ========================================================================= */
const KBIS_CONFIG = {
  SCHOOL_NAME: "KBIS Schools",
  SCHOOL_TAGLINE: "Knowledge in Humility",
  ACCESS_HASH: "4a27dd948c6ef5e17687251b6ef9852871d59cb582868473cd5000e3eed6eba9",
  SESSION_KEY: "kbis_unlocked",
  DATA_BASE: "data/",
};
