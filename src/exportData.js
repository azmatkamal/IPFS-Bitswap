const Excel = require("exceljs");

const exportData = (columns, data, filename) => {
  let workbook = new Excel.Workbook();
  let worksheet = workbook.addWorksheet(`${filename}`);
  if (columns && columns.length) {
    worksheet.columns = [...columns];
    worksheet.columns.forEach((column) => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
    });
    worksheet.getRow(1).font = { bold: true };
  }

  data.forEach((row) => {
    worksheet.addRow({ ...row });
  });

  workbook.xlsx.writeFile(`exports/${filename}.xlsx`);
};

module.exports = { exportData };
