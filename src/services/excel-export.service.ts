import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ExportData {
  sheetName: string;
  data: any[][];
  columns?: { wch: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  /**
   * Export multiple sheets to a single Excel file
   */
  exportToExcel(sheets: ExportData[], fileName: string = 'export.xlsx'): void {
    if (!sheets || sheets.length === 0) {
      console.error('No data to export');
      return;
    }

    const workbook = XLSX.utils.book_new();

    sheets.forEach(sheet => {
      const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);

      // Set column widths if provided
      if (sheet.columns && sheet.columns.length > 0) {
        worksheet['!cols'] = sheet.columns;
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName.substring(0, 31));
    });

    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Export single sheet to Excel
   */
  exportSingleSheet(data: any[][], sheetName: string, fileName: string): void {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Convert JSON data to worksheet array
   */
  convertToWorksheet(header: string[], data: any[], sheetName: string): ExportData {
    const worksheetData: any[][] = [header];

    data.forEach(item => {
      const row = header.map(key => {
        const value = this.getNestedValue(item, key);
        return value !== undefined && value !== null ? value : '';
      });
      worksheetData.push(row);
    });

    return {
      sheetName: sheetName,
      data: worksheetData,
      columns: header.map(() => ({ wch: 15 }))
    };
  }

  /**
   * Get nested object value by dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Export to CSV format
   */
  exportToCSV(data: any[][], fileName: string): void {
    const csvContent = data.map(row =>
      row.map(cell => {
        if (cell === undefined || cell === null) return '';
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
