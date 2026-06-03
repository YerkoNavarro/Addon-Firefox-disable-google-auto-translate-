
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

async function isUrlValid(url) {
  try {
    // verificar la existencia sin descargar todo el contenido
    const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
    return response.ok;
  } catch (error) {
    console.error('Error verificando URL:', url, error);
    return false;
  }
}

browser.webRequest.onBeforeRequest.addListener(
  async function(details) {
    const clean = cleanGoogleTranslateUrl(details.url);
    
    const isValid = await isUrlValid(clean);
    if (isValid) {
      console.log('Redirigiendo:', details.url, '→', clean);
      return { redirectUrl: clean };
    }
    
    console.log('URL original no válida o inaccesible, cancelando redirección.');
    return {}; // No redirige si no es válida
  },
  { urls: ["*://*.translate.goog/*"] },
  ['blocking']
);
