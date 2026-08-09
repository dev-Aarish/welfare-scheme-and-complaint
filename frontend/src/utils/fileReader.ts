/** Reads a File into a `data:<mime>;base64,…` URL so it can be POSTed to the
 *  backend. Resolves null when the file cannot be read (caller shows a
 *  message instead of crashing). */
export function fileToDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}
