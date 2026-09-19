// =====================================================
// НАЛАШТУВАННЯ
// =====================================================

// Якщо Apps Script створений безпосередньо
// із Google Sheets — залишаємо порожнім.
//
// Якщо Apps Script окремий — сюди можна
// вставити ID таблиці.
//
// Приклад:
// const SPREADSHEET_ID = "1AbCdEf...";

const SPREADSHEET_ID = "";


// =====================================================
// ОТРИМАННЯ GOOGLE SHEETS
// =====================================================

function getSheet_() {

  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(
        SPREADSHEET_ID
      )
    : SpreadsheetApp.getActiveSpreadsheet();


  // ---------------------------------------------------
  // Records
  // ---------------------------------------------------

  let records =
    ss.getSheetByName(
      "Records"
    );


  if (!records) {

    records =
      ss.insertSheet(
        "Records"
      );


    records.appendRow([
      "timestamp",
      "day",
      "date",
      "balanceStart",
      "actualProfit",
      "balanceEnd",
      "roi",
      "trades",
      "notes"
    ]);

  }


  // ---------------------------------------------------
  // Plan
  // ---------------------------------------------------

  let plan =
    ss.getSheetByName(
      "Plan"
    );


  if (!plan) {

    plan =
      ss.insertSheet(
        "Plan"
      );


    plan
      .getRange("A1:B6")
      .setValues([

        [
          "balance",
          3200
        ],

        [
          "entryPercent",
          50
        ],

        [
          "leverage",
          10
        ],

        [
          "roi",
          10
        ],

        [
          "target",
          30000
        ],

        [
          "updatedAt",
          new Date()
        ]

      ]);

  }


  return {
    ss,
    records,
    plan
  };

}


// =====================================================
// GET REQUEST
// =====================================================

function doGet(e) {

  try {

    const action =
      e.parameter.action ||
      "getRecords";


    // -----------------------------------------------
    // GET RECORDS
    // -----------------------------------------------

    if (
      action ===
      "getRecords"
    ) {

      return json_({
        ok: true,
        records:
          getRecords_()
      });

    }


    // -----------------------------------------------
    // GET PLAN
    // -----------------------------------------------

    if (
      action ===
      "getPlan"
    ) {

      return json_({
        ok: true,
        plan:
          getPlan_()
      });

    }


    // -----------------------------------------------
    // SAVE RECORD
    // -----------------------------------------------

    if (
      action ===
      "saveRecord"
    ) {

      return json_({

        ok: true,

        record:
          saveRecord_(
            e.parameter
          )

      });

    }


    // -----------------------------------------------
    // SAVE PLAN
    // -----------------------------------------------

    if (
      action ===
      "savePlan"
    ) {

      return json_({

        ok: true,

        plan:
          savePlan_(
            e.parameter
          )

      });

    }


    return json_({

      ok: false,

      error:
        "Unknown action"

    });

  } catch (error) {

    return json_({

      ok: false,

      error:
        String(error)

    });

  }

}


// =====================================================
// JSON RESPONSE
// =====================================================

function json_(object) {

  return ContentService
    .createTextOutput(
      JSON.stringify(object)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

}


// =====================================================
// GET RECORDS
// =====================================================

function getRecords_() {

  const { records } =
    getSheet_();


  const values =
    records
      .getDataRange()
      .getValues();


  if (
    values.length <= 1
  ) {

    return [];

  }


  return values
    .slice(1)
    .map((row) => {

      return {

        timestamp:
          row[0],

        day:
          row[1],

        date:
          row[2],

        balanceStart:
          row[3],

        actualProfit:
          row[4],

        balanceEnd:
          row[5],

        roi:
          row[6],

        trades:
          row[7],

        notes:
          row[8]

      };

    });

}


// =====================================================
// GET PLAN
// =====================================================

function getPlan_() {

  const { plan } =
    getSheet_();


  const values =
    plan
      .getRange(
        "A1:B6"
      )
      .getValues();


  const object = {};


  values.forEach(
    (row) => {

      object[row[0]] =
        row[1];

    }
  );


  return {

    balance:
      Number(
        object.balance ||
        0
      ),

    entryPercent:
      Number(
        object.entryPercent ||
        0
      ),

    leverage:
      Number(
        object.leverage ||
        1
      ),

    roi:
      Number(
        object.roi ||
        0
      ),

    target:
      Number(
        object.target ||
        0
      )

  };

}


// =====================================================
// SAVE RECORD
// =====================================================

function saveRecord_(params) {

  const { records } =
    getSheet_();


  const row = [

    new Date(),

    Number(
      params.day || 0
    ),

    params.date || "",

    Number(
      params.balanceStart ||
      0
    ),

    Number(
      params.actualProfit ||
      0
    ),

    Number(
      params.balanceEnd ||
      0
    ),

    Number(
      params.roi ||
      0
    ),

    Number(
      params.trades ||
      0
    ),

    params.notes || ""

  ];


  records.appendRow(
    row
  );


  return row;

}


// =====================================================
// SAVE PLAN
// =====================================================

function savePlan_(params) {

  const { plan } =
    getSheet_();


  const values = [

    [
      "balance",
      Number(
        params.balance ||
        0
      )
    ],

    [
      "entryPercent",
      Number(
        params.entryPercent ||
        0
      )
    ],

    [
      "leverage",
      Number(
        params.leverage ||
        1
      )
    ],

    [
      "roi",
      Number(
        params.roi ||
        0
      )
    ],

    [
      "target",
      Number(
        params.target ||
        0
      )
    ],

    [
      "updatedAt",
      new Date()
    ]

  ];


  plan
    .getRange(
      "A1:B6"
    )
    .setValues(
      values
    );


  return getPlan_();

}