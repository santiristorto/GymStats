import { FileSpreadsheet, FileText } from "lucide-react";
import { exportToExcel, exportToPdf } from "../utils/export";
import "./ExportButtons.css";

/**
 * @param {string} filename nombre sin extensión para el archivo de Excel
 * @param {{key:string,label:string}[]} columns
 * @param {object[]} rows
 */
function ExportButtons({ filename, columns, rows }) {
  return (
    <div className="export-actions">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => exportToExcel(filename, columns, rows)}
        disabled={rows.length === 0}
      >
        <FileSpreadsheet size={15} /> Excel
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={exportToPdf}>
        <FileText size={15} /> PDF
      </button>
    </div>
  );
}

export default ExportButtons;
