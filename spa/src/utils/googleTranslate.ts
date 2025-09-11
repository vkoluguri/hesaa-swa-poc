// Load the Google Translate widget one time and mount it inside #gt-container
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export function mountGoogleTranslate() {
  if (document.getElementById("google-translate-script")) return;

  // Called by Google when the script is ready
  window.googleTranslateElementInit = function () {
    /* eslint-disable no-new */
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        // Pick a broad set; you can trim this list as you like.
        includedLanguages:
          "af,ar,bg,bn,cs,da,de,el,en,es,fa,fi,fr,gu,he,hi,hr,hu,id,it,ja,ko,lt,lv,ml,mr,ms,nl,no,pl,pt,ro,ru,sk,sl,sr,sv,ta,te,th,tr,uk,ur,vi,zh-CN,zh-TW",
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      "gt-container"
    );
  };

  const s = document.createElement("script");
  s.id = "google-translate-script";
  s.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.defer = true;
  document.body.appendChild(s);
}
