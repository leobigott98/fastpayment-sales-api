// Define font files
var fonts = {
  Courier: {
    normal: "Courier",
    bold: "Courier-Bold",
    italics: "Courier-Oblique",
    bolditalics: "Courier-BoldOblique",
  },
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
  Times: {
    normal: "Times-Roman",
    bold: "Times-Bold",
    italics: "Times-Italic",
    bolditalics: "Times-BoldItalic",
  },
  Symbol: {
    normal: "Symbol",
  },
  ZapfDingbats: {
    normal: "ZapfDingbats",
  },
};

var PdfPrinter = require("pdfmake");
var printer = new PdfPrinter(fonts);
const fs = require("fs");

// Declaring your layout
var myTableLayouts = {
  exampleLayout: {
    hLineWidth: function (i, node) {
      if (i === 0 || i === node.table.body.length) {
        return 0;
      }
      return i === node.table.headerRows ? 2 : 1;
    },
    vLineWidth: function (i) {
      return 0;
    },
    hLineColor: function (i) {
      return i === 1 ? "black" : "#aaa";
    },
    paddingLeft: function (i) {
      return i === 0 ? 0 : 8;
    },
    paddingRight: function (i, node) {
      return i === node.table.widths.length - 1 ? 0 : 8;
    },
  },
};

//Doc Definition
var docDefinition = {
  background: function(currentPage, pageSize) {
    return `page ${currentPage} with size ${pageSize.width} x ${pageSize.height}`
  },
  footer: function (currentPage, pageCount) {
    return [{
      text: currentPage.toString() + " of " + pageCount,
      margin: 5}]
  },
  header: function (currentPage, pageCount, pageSize) {
    // you can apply any logic and return any valid pdfmake element

    return [
      {
        text: "simple text",
        alignment: currentPage % 2 ? "left" : "right",
        margin: 5
      },
      {
        canvas: [
          { type: "rect", x: 170, y: 32, w: pageSize.width - 170, h: 40 },
        ],
      },
    ];
  },
  content: [
    {
      layout: "lightHorizontalLines", // optional
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ["*", "auto", 100, "*"],

        body: [
          ["First", "Second", "Third", "The last one"],
          ["Value 1", "Value 2", "Value 3", "Value 4"],
          [{ text: "Bold value", bold: true }, "Val 2", "Val 3", "Val 4"],
        ],
      },
    },
  ],
  defaultStyle: {
    font: "Helvetica",
  },
};

// Building the PDF
var pdfDoc = printer.createPdfKitDocument(docDefinition, {
  tableLayouts: myTableLayouts,
});

// Writing it to disk
pdfDoc.pipe(fs.createWriteStream("document.pdf"));
pdfDoc.end();
