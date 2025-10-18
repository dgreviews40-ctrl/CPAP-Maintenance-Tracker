/**
 * Converts an array of objects into a CSV string.
 * @param data Array of objects to convert.
 * @param columns Optional array of column keys to include and their display headers.
 * @returns CSV string.
 */
export function convertToCSV(
  data: Record<string, any>[],
  columns?: { key: string; header: string }[]
): string {
  if (data.length === 0) return "";

  const keys = columns ? columns.map(col => col.key) : Object.keys(data[0]);
  const headers = columns ? columns.map(col => col.header) : keys;

  // Helper to escape values for CSV
  const escapeValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    let str = String(value);
    // If the string contains commas, double quotes, or newlines, wrap it in double quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      // Escape double quotes by doubling them
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    }
    return str;
  };

  // 1. Header Row
  const headerRow = headers.map(escapeValue).join(',');

  // 2. Data Rows
  const dataRows = data.map(row => {
    return keys.map(key => escapeValue(row[key])).join(',');
  }).join('\n');

  return `${headerRow}\n${dataRows}`;
}

/**
 * Triggers a file download in the browser.
 * @param csvString The CSV content.
 * @param filename The name of the file to download.
 */
export function downloadCSV(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}