/** Axios config: POST raw HTML (no JSON) so WAF/proxies cannot strip JSON quotes around `<table>`. */
export function signatureExportRequestConfig() {
  return {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    transformRequest: [
      (data, headers) => {
        headers['Content-Type'] = 'text/html; charset=utf-8';
        return data;
      },
    ],
  };
}
