// src/utils/export.ts

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(";"),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          // Экранируем кавычки и оборачиваем в кавычки если есть спецсимволы
          if (
            typeof val === "string" &&
            (val.includes(";") || val.includes('"'))
          ) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val ?? "";
        })
        .join(";"),
    ),
  ].join("\n");

  // BOM для корректного отображения кириллицы в Excel
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function formatDateForExport(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU");
}

export function formatMoneyForExport(amount: number): string {
  return amount.toFixed(2).replace(".", ",");
}
