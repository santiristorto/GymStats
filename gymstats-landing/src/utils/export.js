function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value) {
  const str = String(value ?? "");
  return /[",\n;]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/**
 * Exporta filas a un archivo .xls que Excel abre nativamente (tabla HTML con
 * el mimetype de Excel). No requiere ninguna librería externa.
 * @param {string} filename sin extensión
 * @param {{key:string,label:string}[]} columns
 * @param {object[]} rows
 */
export function exportToExcel(filename, columns, rows) {
  const head = columns.map((c) => `<th>${c.label}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${columns.map((c) => `<td>${row[c.key] ?? ""}</td>`).join("")}</tr>`)
    .join("");

  const html = `<html><head><meta charset="UTF-8"></head><body><table border="1">
    <thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;

  triggerDownload(html, `${filename}.xls`, "application/vnd.ms-excel");
}

/**
 * Exporta filas a un .csv plano (alternativa liviana, útil para importar en
 * cualquier planilla de cálculo).
 */
export function exportToCsv(filename, columns, rows) {
  const head = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => escapeCsvCell(row[c.key])).join(",")).join("\n");
  triggerDownload(`${head}\n${body}`, `${filename}.csv`, "text/csv;charset=utf-8;");
}

/**
 * "Exportar a PDF" sin librerías: dispara el diálogo de impresión del
 * navegador, que en cualquier sistema permite guardar como PDF. La hoja de
 * estilos de impresión (ver global.css) oculta el sidebar y los controles.
 */
export function exportToPdf() {
  window.print();
}
