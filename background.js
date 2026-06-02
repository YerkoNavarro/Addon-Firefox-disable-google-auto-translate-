browser.webRequest.onBeforeRequest.addListener(
  function(details) {
    const clean = cleanGoogleTranslateUrl(details.url); // 
    console.log('Redirigiendo:', details.url, '→', clean); // 
    return { redirectUrl: clean };
  },
  { urls: ["*://*.translate.goog/*"] },
  ['blocking']
);

function cleanGoogleTranslateUrl(translatedUrl) {
  const url = new URL(translatedUrl);
  const hostname = url.hostname
    .replace('.translate.goog', '')
    .replaceAll('-', '.');

  const cleanParams = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    if (!key.startsWith('_x_tr_')) {
      cleanParams.append(key, value);
    }
  }

  const cleanUrl = new URL(url.pathname, `https://${hostname}`); //forzar https
  cleanUrl.search = cleanParams.toString();
  return cleanUrl.toString();
}