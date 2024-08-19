const PdfPrinter = require("pdfmake");
const fs = require("fs");

const makePDF = (salesperson_name, salesperson_last, sale_serie, cusm_namec, rif_cliente, tlf_movil, tlf_local, ciud_desc, add_street, add_level, add_ofic, parr_desc, municp_desc, estad_desc, sale_details, sale_total, sale_dreg)=>{

  const productsArray = (item)=>{
    return [
      
      {text: `${item.prod_model}`, alignment: 'center', fontSize: 10, border:[true, false, false, false]}, 
      {text: `${item.saledt_qty}`, alignment: 'center', fontSize: 10, border:[false, false, false, false]}, 
      {text: `$${item.prod_price}`, alignment: 'center', fontSize: 10, border:[false, false, false, false]},
      {text: `$${item.prod_price * item.saledt_qty}`, alignment: 'center', fontSize: 10, border:[false, false, true, false]},
      ] 
  };
  const planArray = (item)=>{
    return [
      {text: `${item.plan_desc}`, alignment: 'left', fontSize: 10, colSpan: 4, border:[true, false, true, true]}, {}, {}, {}
    ]
  }; 

  const tableHeader = ()=>{
    return [
      {text: 'PRODUCTO', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[true, true, false, false]}, 
      {text: 'CANTIDAD', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, false, false]}, 
      {text: 'PRECIO UNITARIO', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, false, false]},
      {text: 'TOTAL', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, true, false]}
    ]
  }

  const rowsArray = ()=>{
    const array = []
    sale_details.forEach((item)=>{
      array.push([...productsArray(item)], [...planArray(item)])
    })
    return array;
  }

  const object = {
      widths: ['*', '*', '*', '*'],
      body: [
        [
          {text: 'PRODUCTO', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[true, true, false, false]}, 
          {text: 'CANTIDAD', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, false, false]}, 
          {text: 'PRECIO UNITARIO', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, false, false]},
          {text: 'TOTAL', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, true, false]}
        ], 
        ...rowsArray()

          ]
  }
  //console.log(object.body)
  // Define font files
const fonts = {
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

const printer = new PdfPrinter(fonts);


// Declaring your layout
const myTableLayouts = {
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
const docDefinition = {

  footer: function (currentPage, pageCount) {
    return [{
      text: currentPage.toString() + " de " + pageCount,
      margin: [20,5],
      alignment: "right"}]
  },
  header: function (currentPage, pageCount, pageSize) {
    // you can apply any logic and return any valid pdfmake element

    return [

      { text: 'Cotización de Venta', style: 'header', alignment: 'center', margin: [0, 20, 0, 0], bold: true, fontSize: 20 },

    ];
  },

  content: [
    {
      columns: [
        {
          image: "images/LogotipoFastPayment-03.png",
          width: 120,
          height: 60 
        },
        { text: [
          {text: 'Fecha: ', alignment: 'right', margin: [5], bold: true},
          {text: new Date(sale_dreg).toLocaleDateString(), alignment: 'right', margin: [5]},
          {text: '\nHora: ', alignment: 'right', margin: [5], bold: true},
          {text: new Date(sale_dreg).toLocaleTimeString(), alignment: 'right', margin: [5]},
          {text: '\nVendedor: ', alignment: 'right', margin: [5], bold: true},
          {text: `${salesperson_name} `, alignment: 'right', margin: [5]},
          {text: `${salesperson_last}`, alignment: 'right', margin: [5]}
        ], margin: [20, 20, 0, 0] }
      ], margin: [0,0,0,5]},   
    {
			canvas: [
				{
					type: 'line',
					x1: 0, y1: 0,
					x2: 510, y2: 0,
					lineWidth: 1
				},
			], margin: [0,0,0,10]
		},
    {
      text: [
        {text: 'Nro de Serie: ', alignment: 'right', margin: [5], bold: true},
        {text: `${sale_serie}`, alignment: 'right', margin: [5]},
      ]
    },
    {
      text: 'DATOS DEL CLIENTE', style: 'subheader', alignment: 'center', bold: true, fontSize: 15, margin: [0,5]
    },
    {
      table:{
        widths: ['auto', '*', '*'],
        body: [
          [{text: [{text: 'CLIENTE: ', bold: true}, {text: `${cusm_namec}`}], alignment: 'left', fontSize: 7}, {text: [{text: 'RIF: ', bold: true}, {text: `${rif_cliente}`}], alignment: 'left', fontSize: 7}, {text: [{text: 'TELEFONO: ', bold: true}, {text: `${tlf_movil}/${tlf_local}`}], alignment: 'left', fontSize: 7}],
          [{text: [{text: 'DIRECCIÓN: ', bold: true}, {text: `${add_street}, ${add_level}, ${add_ofic}, ${ciud_desc}. Parr. ${parr_desc}. Mun. ${municp_desc}. Edo. ${estad_desc}`}], colSpan: 3, alignment: 'left', fontSize: 7}, {}, {}]
        ]
      }
    },
    {
      text: 'PRODUCTOS', style: 'subheader', alignment: 'center', bold: true, fontSize: 15, margin: [0,10]
    },
    {
      table: {
          widths: ['*', '*', '*', '*'],
          body: [
        [
          {text: 'PRODUCTO', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[true, true, false, true]}, 
          {text: 'CANTIDAD', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, false, true]}, 
          {text: 'PRECIO UNITARIO', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, false, true]},
          {text: 'TOTAL', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, true, true]}
        ], 
        ...rowsArray(),
        [
          {text: '', alignment: 'center', fontSize: 10, style: 'tableHeader', colSpan: 2, border:[true, false, false, true]}, {}, 
          {text: 'TOTAL COTIZACIÓN', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, border:[false, false, false, true]}, 
          {text: `$${sale_total}`, alignment: 'center', fontSize: 10, border:[false, false, true, true]}
        ]  
           
        /* ...sale_details.map((item)=>{
          return [
            {text: `${item.prod_model}`, alignment: 'center', fontSize: 10, border:[true, false, false, false]}, 
            {text: `${item.saledt_qty}`, alignment: 'center', fontSize: 10, border:[false, false, false, false]}, 
            {text: `$${item.prod_price}`, alignment: 'center', fontSize: 10, border:[false, false, false, false]},
            {text: `${item.prod_price * item.saledt_qty}`, alignment: 'center', fontSize: 10, border:[false, false, true, false]}
          ]
          
          //[{text: `${item.plan_desc}`, alignment: 'left', fontSize: 10, colSpan: 4, border:[true, false, true, true]}, {}, {}, {}]
        })    */
          ]
        
          /* return [
            [
              {text: 'PRODUCTO', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[true, true, false, false]}, 
              {text: 'CANTIDAD', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, false, false]}, 
              {text: 'PRECIO UNITARIO', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, false, false]},
              {text: 'TOTAL', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, true, false]}
            ],
          sale_details.map((item)=>{
            return ( 
              [
                {text: `${item.prod_model}`, alignment: 'center', fontSize: 10, border:[true, false, false, false]}, 
                {text: `${item.saledt_qty}`, alignment: 'center', fontSize: 10, border:[false, false, false, false]}, 
                {text: `$${item.prod_price}`, alignment: 'center', fontSize: 10, border:[false, false, false, false]},
                {text: `${item.prod_price * item.saledt_qty}`, alignment: 'center', fontSize: 10, border:[false, false, true, false]}
              ],
              [{text: `${item.plan_desc}`, alignment: 'left', fontSize: 10, colSpan: 4, border:[true, false, true, true]}, {}, {}, {}]
          )
          }),
          [{text: 'TOTAL COTIZACIÓN', alignment: 'right', fontSize: 12, colSpan: 3, bold: true, border:[true, false, false, true]}, {}, {}, {text: `${sale_total}`, alignment: 'center', fontSize: 12, colSpan: 1, border:[false, false, true, true]}]
        ] */
        }
        
        /* [
          [
            {text: 'PRODUCTO', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[true, true, false, false]}, 
            {text: 'CANTIDAD', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, false, false]}, 
            {text: 'PRECIO UNITARIO', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, false, false]},
            {text: 'TOTAL', alignment: 'center', fontSize: 10, style: 'tableHeader', bold: true, fillColor: '#CCCCCC', border:[false, true, true, false]}
          ],
          [
            {text: `${prod_model}`, alignment: 'center', fontSize: 10, border:[true, false, false, false]}, 
            {text: `${saledt_qty}`, alignment: 'center', fontSize: 10, border:[false, false, false, false]}, 
            {text: `$${prod_price}`, alignment: 'center', fontSize: 10, border:[false, false, false, false]},
            {text: `${saledt_total}`, alignment: 'center', fontSize: 10, border:[false, false, true, false]}
          ],
          [{text: `${plan_desc}`, alignment: 'left', fontSize: 10, colSpan: 4, border:[true, false, true, true]}, {}, {}, {}],
          [{text: 'TOTAL COTIZACIÓN', alignment: 'right', fontSize: 12, colSpan: 3, bold: true, border:[true, false, false, true]}, {}, {}, {text: `${sale_total}`, alignment: 'center', fontSize: 12, colSpan: 1, border:[false, false, true, true]}]
        ], */
      },
    {
      text: ['A continuación le informamos el monto del equipo vigente al día de hoy ', {text: `${new Date(sale_dreg).toLocaleDateString()}.`, bold: true}, ' Válido durante ', {text: '24 horas,', bold: true}, 
        ' tiempo en el cual deberá realizar su pago y reportar en horario de oficina. Realice la transferencia, depósito o pago móvil en cualquiera de las siguientes cuentas:'
       ], margin: [0, 5]
    },
    {text: 'Datos Cuenta Bancaria', margin: [0, 5], fontSize: 10, bold: true, alignment: "center"},
    {
      table: {
        widths: ['*', '*', 'auto', '*', '*'],
        body: [
          [
            {text: 'BANCO', bold: true, fontSize: 10, style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center'},
            {text: 'TIPO DE CUENTA', bold: true, fontSize: 10, style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center'},
            {text: 'NÚMERO', bold: true, fontSize: 10, style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center'},
            {text: 'TITULAR', bold: true, fontSize: 10, style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center'},
            {text: 'RIF', bold: true, fontSize: 10, style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center'}
          ],
          [
            {text: 'BICENTENARIO', fontSize: 7, alignment: 'left'},
            {text: 'CORRIENTE', fontSize: 7, alignment: 'left'},
            {text: '0175-0443-63-0076684917', fontSize: 7, alignment: 'left'},
            {text: 'FASTPAYMENT', fontSize: 7, alignment: 'left'},
            {text: 'J-412118218', fontSize: 7, alignment: 'left'}
          ],
        ]
      }
    },
    {text: 'Datos Pago Móvil', margin: [0, 5], fontSize: 10, bold: true, alignment: "center"},
    {
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [
            {text: 'BANCO', bold: true, fontSize: 10, style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center'},
            {text: 'TELÉFONO', bold: true, fontSize: 10, style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center'},
            {text: 'RIF', bold: true, fontSize: 10, style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center'},
            {text: 'TITULAR', bold: true, fontSize: 10, style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center'},
          ],
          [
            {text: 'MERCANTIL', fontSize: 7, alignment: 'left'},
            {text: '0412-9326767', fontSize: 7, alignment: 'left'},
            {text: 'V27488795', fontSize: 7, alignment: 'left'},
            {text: 'LEONARDO BIGOTT', fontSize: 7, alignment: 'left'},
          ]
        ]
      }
    }
  ],
  defaultStyle: {
    font: "Helvetica",
  },
};

// Building the PDF
const pdfDoc = printer.createPdfKitDocument(docDefinition, {
  tableLayouts: myTableLayouts,
});

// Writing it to disk
pdfDoc.pipe(fs.createWriteStream(`../API/sales/docs/CotizacionFastPayment-${sale_serie}.pdf`));
pdfDoc.end();

}

module.exports = {makePDF}


