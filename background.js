
/*
  cleanGoogleTranslateUrl limpia la url original modificada por google translate
*/
function cleanGoogleTranslateUrl(translatedUrl) { 
  const url = new URL(translatedUrl);
  const hostname = url.hostname
    .replace('.translate.goog', '')
    .replaceAll('--', '\x00')   // ← paso 1: proteger guiones reales
    .replaceAll('-', '.')        // ← paso 2: convertir separadores → puntos
    .replaceAll('\x00', '-');    // ← paso 3: restaurar guiones reales

  const cleanParams = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    if (!key.startsWith('_x_tr_')) {
      cleanParams.append(key, value);
    }
  }

  const toHttps = new URL(url.pathname, `https://${hostname}`); //forzar https
  toHttps.search = cleanParams.toString();
  return toHttps.toString();
}


browser.webRequest.onBeforeRequest.addListener(
  function(details) {
    try {
      const clean = cleanGoogleTranslateUrl(details.url);
      return { redirectUrl: clean };
    } catch (e) {
      console.error("Disable Google Translate: error processing", details.url, e);
      return undefined;
    }
  },
  { urls: ["*://*.translate.goog/*"] },
  ['blocking']
);
