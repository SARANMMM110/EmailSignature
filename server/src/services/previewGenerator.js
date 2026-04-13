/**
 * Wraps signature HTML fragment in a minimal document for iframe srcdoc previews.
 */
export function wrapForPreview(signatureHTML) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Arial, sans-serif;
    padding: 16px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
</style>
</head>
<body>
${signatureHTML}
</body>
</html>`;
}
