import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  BarChart3,
  Save,
  Pencil,
  Trash2,
  X
} from "lucide-react";

import api from "../api";


function getToday() {
  const now = new Date();

  const localDate =
    new Date(
      now.getTime() -
      now.getTimezoneOffset() *
      60000
    );

  return localDate
    .toISOString()
    .slice(0, 10);
}


function formatMoney(value) {
  return Number(
    value || 0
  ).toLocaleString(
    "uk-UA",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}


function formatDate(value) {

  if (!value) {
    return "—";
  }


  // Якщо дата вже у форматі
  // YYYY-MM-DD

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {

    const [
      year,
      month,
      day
    ] = value.split("-");

    return `${day}.${month}.${year}`;

  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);

  }


  return date.toLocaleDateString(
    "uk-UA"
  );

}


// =====================================================
// ПЕРЕРАХУНОК ВСІЄЇ ІСТОРІЇ
// =====================================================
//
// Якщо змінюємо День 2,
// День 3, День 4 і т.д.
// повинні автоматично отримати
// правильний баланс на початку.
//
// =====================================================

function recalculateRecords(
  records,
  plan
) {

  const sorted =
    [...records].sort(
      (a, b) => {

        const dayDifference =
          Number(a.day || 0) -
          Number(b.day || 0);

        if (
          dayDifference !== 0
        ) {

          return dayDifference;

        }


        return String(
          a.timestamp || ""
        ).localeCompare(
          String(
            b.timestamp || ""
          )
        );

      }
    );


  let previousBalance =
    Number(
      plan.balance
    ) || 0;


  return sorted.map(
    (record, index) => {

      const balanceStart =
        previousBalance;


      const balanceEnd =
        Number(
          record.balanceEnd
        ) || 0;


      const actualProfit =
        balanceEnd -
        balanceStart;


      // Маржа = частина балансу,
      // яка використовується у позиції.

      const margin =
        balanceStart *
        (
          Number(
            plan.entryPercent
          ) / 100
        );


      // ROI рахуємо від маржі.

      const roi =
        margin > 0
          ? (
            actualProfit /
            margin
          ) * 100
          : 0;


      const updatedRecord = {

        ...record,

        day:
          index + 1,

        balanceStart,

        actualProfit,

        balanceEnd,

        roi

      };


      previousBalance =
        balanceEnd;


      return updatedRecord;

    }
  );

}


export default function AnalyticsPage() {

  // ===================================================
  // STATE
  // ===================================================

  const [
    records,
    setRecords
  ] = useState([]);


  const [
    plan,
    setPlan
  ] = useState({

    balance: 3200,

    entryPercent: 50,

    leverage: 10,

    roi: 10,

    target: 30000

  });


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    saving,
    setSaving
  ] = useState(false);


  const [
    editingTimestamp,
    setEditingTimestamp
  ] = useState(null);

  const [
    deleteRecord,
    setDeleteRecord
  ] = useState(null);

  // Поточний баланс,
  // який вводить користувач.

  const [
    currentBalance,
    setCurrentBalance
  ] = useState("");


  // Необов'язкове поле.

  const [
    trades,
    setTrades
  ] = useState("");


  // Необов'язкове поле.

  const [
    notes,
    setNotes
  ] = useState("");


  // ===================================================
  // ЗАВАНТАЖЕННЯ
  // ===================================================

  useEffect(() => {

    loadAnalytics();

  }, []);


  async function loadAnalytics() {

    try {

      setLoading(true);


      const [
        loadedRecords,
        loadedPlan
      ] = await Promise.all([

        api.getRecords(),

        api.getPlan()

      ]);


      if (loadedPlan) {

        setPlan({

          balance:
            Number(
              loadedPlan.balance
            ) || 3200,

          entryPercent:
            Number(
              loadedPlan.entryPercent
            ) || 50,

          leverage:
            Number(
              loadedPlan.leverage
            ) || 10,

          roi:
            Number(
              loadedPlan.roi
            ) || 10,

          target:
            Number(
              loadedPlan.target
            ) || 30000

        });

      }


      setRecords(
        loadedRecords || []
      );


    } catch (error) {

      console.error(
        error
      );

      alert(
        error.message ||
        "Не вдалося завантажити дані"
      );


    } finally {

      setLoading(false);

    }

  }


  // ===================================================
  // СОРТУВАННЯ
  // ===================================================

  const sortedRecords =
    useMemo(() => {

      return [...records].sort(
        (a, b) =>
          Number(a.day || 0) -
          Number(b.day || 0)
      );

    }, [records]);


  // ===================================================
  // ОСТАННІЙ ЗАПИС
  // ===================================================

  const lastRecord =
    sortedRecords[
    sortedRecords.length - 1
    ];


  // ===================================================
  // ПОТОЧНИЙ БАЛАНС
  // ===================================================

  const actualBalance =
    lastRecord

      ? Number(
        lastRecord.balanceEnd
      )

      : Number(
        plan.balance
      );


  // ===================================================
  // ПОТОЧНИЙ ДЕНЬ
  // ===================================================

  const currentDay =
    lastRecord

      ? Number(
        lastRecord.day
      )

      : 0;


  // ===================================================
  // ЗАГАЛЬНИЙ PNL
  // ===================================================

  const totalProfit =
    actualBalance -
    Number(
      plan.balance
    );


  // ===================================================
  // ПРОГРЕС
  // ===================================================

  const progress =
    Number(
      plan.target
    ) > 0

      ? Math.min(

        100,

        Math.max(

          0,

          (
            actualBalance /
            Number(
              plan.target
            )
          ) * 100

        )

      )

      : 0;


  // ===================================================
  // ПЛАНОВИЙ ЩОДЕННИЙ РІСТ
  // ===================================================

  const dailyGrowth =

    (
      Number(
        plan.entryPercent
      ) / 100
    )

    *

    (
      Number(
        plan.roi
      ) / 100
    );


  // ===================================================
  // ПЛАНОВИЙ БАЛАНС
  // ===================================================

  const plannedBalance =

    Number(
      plan.balance
    )

    *

    Math.pow(

      1 + dailyGrowth,

      currentDay

    );


  // ===================================================
  // ПОПЕРЕДНІЙ БАЛАНС
  // ===================================================

  const previousBalance =

    lastRecord

      ? Number(
        lastRecord.balanceEnd
      )

      : Number(
        plan.balance
      );


  // ===================================================
  // ЗАПИС, ЯКИЙ РЕДАГУЄМО
  // ===================================================

  const editingRecord =

    editingTimestamp

      ? records.find(
        record =>
          String(
            record.timestamp
          ) ===
          String(
            editingTimestamp
          )
      )

      : null;


  // ===================================================
  // ПАРАМЕТРИ ФОРМИ
  // ===================================================

  const formStartBalance =

    editingRecord

      ? Number(
        editingRecord.balanceStart
      )

      : previousBalance;


  const formDay =

    editingRecord

      ? Number(
        editingRecord.day
      )

      : currentDay + 1;


  const formDate =

    editingRecord

      ? String(
        editingRecord.date ||
        getToday()
      )

      : getToday();


  // ===================================================
  // АВТОМАТИЧНИЙ PNL
  // ===================================================

  const calculatedProfit =

    currentBalance !== ""

      ? Number(
        currentBalance
      ) -
      formStartBalance

      : 0;


  // ===================================================
  // МАРЖА
  // ===================================================

  const calculatedMargin =

    formStartBalance *

    (
      Number(
        plan.entryPercent
      ) / 100
    );


  // ===================================================
  // АВТОМАТИЧНИЙ ROI
  // ===================================================

  const calculatedRoi =

    calculatedMargin > 0

      ? (
        calculatedProfit /
        calculatedMargin
      ) * 100

      : 0;


  // ===================================================
  // ОЧИСТИТИ ФОРМУ
  // ===================================================

  function resetForm() {

    setEditingTimestamp(
      null
    );

    setCurrentBalance(
      ""
    );

    setTrades(
      ""
    );

    setNotes(
      ""
    );

  }


  // ===================================================
  // РЕДАГУВАННЯ
  // ===================================================

  function startEdit(record) {

    setEditingTimestamp(
      record.timestamp
    );


    setCurrentBalance(
      String(
        record.balanceEnd
      )
    );


    setTrades(
      record.trades ?? ""
    );


    setNotes(
      record.notes ?? ""
    );


    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  }


  // ===================================================
  // ЗБЕРЕЖЕННЯ
  // ===================================================

  async function handleSave() {

    if (
      currentBalance === ""
    ) {

      alert(
        "Введи поточний баланс"
      );

      return;

    }


    const balanceValue =
      Number(
        currentBalance
      );


    if (
      Number.isNaN(
        balanceValue
      )
    ) {

      alert(
        "Некоректний баланс"
      );

      return;

    }


    if (
      balanceValue < 0
    ) {

      alert(
        "Баланс не може бути від'ємним"
      );

      return;

    }


    try {

      setSaving(true);


      let updatedRecords;


      // ---------------------------------------------
      // РЕДАГУВАННЯ
      // ---------------------------------------------

      if (editingRecord) {

        updatedRecords =
          records.map(
            record => {

              if (
                String(
                  record.timestamp
                ) ===
                String(
                  editingRecord.timestamp
                )
              ) {

                return {

                  ...record,

                  balanceEnd:
                    balanceValue,

                  trades:
                    Number(
                      trades
                    ) || 0,

                  notes

                };

              }


              return record;

            }
          );


      } else {

        // -------------------------------------------
        // НОВИЙ ДЕНЬ
        // -------------------------------------------

        updatedRecords = [

          ...records,

          {

            timestamp:
              new Date()
                .toISOString(),

            day:
              formDay,

            date:
              getToday(),

            balanceStart:
              previousBalance,

            actualProfit:
              balanceValue -
              previousBalance,

            balanceEnd:
              balanceValue,

            roi:
              calculatedRoi,

            trades:
              Number(
                trades
              ) || 0,

            notes

          }

        ];

      }


      // ---------------------------------------------
      // ПЕРЕРАХУНОК ВСІЄЇ ІСТОРІЇ
      // ---------------------------------------------

      const recalculated =
        recalculateRecords(
          updatedRecords,
          plan
        );


      // ---------------------------------------------
      // ЗАПИС У GOOGLE SHEETS
      // ---------------------------------------------

      await api.replaceRecords(
        recalculated
      );


      // ---------------------------------------------
      // ОНОВЛЮЄМО ЛОКАЛЬНИЙ STATE
      // ---------------------------------------------

      setRecords(
        recalculated
      );


      resetForm();


    } catch (error) {

      console.error(
        error
      );


      alert(
        error.message ||
        "Не вдалося зберегти результат"
      );


    } finally {

      setSaving(false);

    }

  }


  // ===================================================
  // ВИДАЛЕННЯ
  // ===================================================

  async function handleDelete(
    record
  ) {

    setDeleteRecord(
      record
    );

  }

  async function confirmDelete() {

    if (!deleteRecord) {
      return;
    }


    try {

      setSaving(true);


      const filtered =
        records.filter(
          item =>

            String(
              item.timestamp
            ) !==
            String(
              deleteRecord.timestamp
            )
        );


      const recalculated =
        recalculateRecords(
          filtered,
          plan
        );


      await api.replaceRecords(
        recalculated
      );


      setRecords(
        recalculated
      );


      if (
        String(
          editingTimestamp
        ) ===
        String(
          deleteRecord.timestamp
        )
      ) {

        resetForm();

      }


      setDeleteRecord(
        null
      );


    } catch (error) {

      console.error(
        error
      );


      alert(
        error.message ||
        "Не вдалося видалити запис"
      );


    } finally {

      setSaving(false);

    }

  }

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (

      <div className="page">

        <div className="card">

          Завантаження...

        </div>


      </div>

    );

  }


  // ===================================================
  // PAGE
  // ===================================================

  return (

    <div className="page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <h1>
            Аналітика
          </h1>

          <p>
            Внось фактичний баланс
            та порівнюй його із планом.
          </p>

        </div>

      </div>


      {/* =================================================
          ПРОГРЕС
      ================================================= */}

      <div className="card progress-card">

        <div className="progress-top">

          <div>

            <span className="muted">
              Прогрес до цілі
            </span>

            <h2>

              {formatMoney(
                actualBalance
              )}

              {" / "}

              {formatMoney(
                plan.target
              )}

              {" USDT"}

            </h2>

          </div>


          <strong className="progress-percent">

            {progress.toFixed(1)}
            %

          </strong>

        </div>


        <div className="progress-bar">

          <div
            className="progress-bar-fill"
            style={{
              width:
                `${progress}%`
            }}
          />

        </div>


        <div className="progress-info">

          <span>

            День:

            {" "}

            <strong>
              {currentDay}
            </strong>
            {" "}
          </span>


          <span>

            Загальний PnL:

            {" "}

            <strong
              className={
                totalProfit >= 0
                  ? "positive"
                  : "negative"
              }
            >

              {totalProfit >= 0
                ? "+"
                : ""}

              {formatMoney(
                totalProfit
              )}

              {" USDT"}

            </strong>
            {" "}

          </span>


          <span>

            Плановий баланс:

            {" "}

            <strong>

              {formatMoney(
                plannedBalance
              )}

              {" USDT"}

            </strong>

          </span>

        </div>

      </div>


      {/* =================================================
          ФОРМА
      ================================================= */}

      <div className="card">

        <div className="section-title-row">

          <h2>

            <Save size={20} />

            {editingRecord
              ? "Редагувати результат дня"
              : "Внести результат дня"}

          </h2>


          {editingRecord && (

            <button
              type="button"
              className="secondary-button"
              onClick={
                resetForm
              }
            >

              <X size={18} />

              Скасувати

            </button>

          )}

        </div>


        <div className="form-grid">


          {/* ДЕНЬ */}

          <div className="field">

            <label>
              День
            </label>

            <input
              type="number"
              value={formDay}
              readOnly
              className="readonly-input"
            />

          </div>


          {/* ДАТА */}

          <div className="field">

            <label>
              Дата
            </label>

            <input
              type="date"
              value={formDate}
              readOnly
              className="readonly-input"
            />

          </div>


          {/* ПОЧАТКОВИЙ БАЛАНС */}

          <div className="field">

            <label>
              Баланс на початку
            </label>

            <input
              type="number"
              value={
                formStartBalance
              }
              readOnly
              className="readonly-input"
            />

          </div>


          {/* ПОТОЧНИЙ БАЛАНС */}

          <div className="field">

            <label>
              Поточний баланс, USDT
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={
                currentBalance
              }
              onChange={e =>
                setCurrentBalance(
                  e.target.value
                )
              }
              placeholder="Наприклад: 3613"
              autoFocus
            />

            <small className="field-hint">

              Введи тільки поточний
              баланс на рахунку.

            </small>

          </div>


          {/* PNL */}

          <div className="field">

            <label>
              Фактичний прибуток / збиток
            </label>

            <input
              type="number"
              value={
                calculatedProfit
              }
              readOnly
              className={
                calculatedProfit >= 0
                  ? "readonly-input input-positive"
                  : "readonly-input input-negative"
              }
            />

          </div>


          {/* ROI */}

          <div className="field">

            <label>
              ROI за день, %
            </label>

            <input
              type="number"
              value={
                calculatedRoi.toFixed(
                  2
                )
              }
              readOnly
              className="readonly-input"
            />

          </div>


          {/* УГОДИ */}

          <div className="field">

            <label>
              Кількість угод
            </label>

            <input
              type="number"
              min="0"
              value={trades}
              onChange={e =>
                setTrades(
                  e.target.value
                )
              }
              placeholder="Необов'язково"
            />

          </div>


          {/* КОМЕНТАР */}

          <div className="field field-full">

            <label>
              Коментар / примітка
            </label>

            <textarea
              value={notes}
              onChange={e =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Наприклад: 2 LONG, 1 SHORT..."
              rows="3"
            />

          </div>

        </div>


        {/* =================================================
            ПРЕВ'Ю РОЗРАХУНКУ
        ================================================= */}

        {currentBalance !== "" && (

          <div className="calculation-preview">


            <div>

              <span>
                Попередній баланс
              </span>

              <strong>

                {formatMoney(
                  formStartBalance
                )}

                {" USDT"}

              </strong>

            </div>


            <div>

              <span>
                Зміна
              </span>

              <strong
                className={
                  calculatedProfit >= 0
                    ? "positive"
                    : "negative"
                }
              >

                {calculatedProfit >= 0
                  ? "+"
                  : ""}

                {formatMoney(
                  calculatedProfit
                )}

                {" USDT"}

              </strong>

            </div>


            <div>

              <span>
                Новий баланс
              </span>

              <strong>

                {formatMoney(
                  Number(
                    currentBalance
                  )
                )}

                {" USDT"}

              </strong>

            </div>


            <div>

              <span>
                ROI
              </span>

              <strong>

                {calculatedRoi.toFixed(
                  2
                )}

                %

              </strong>

            </div>


          </div>

        )}


        {/* =================================================
            SAVE BUTTON
        ================================================= */}

        <button
          type="button"
          className="primary"
          onClick={
            handleSave
          }
          disabled={saving}
        >

          <Save size={18} />

          {saving

            ? "Збереження..."

            : editingRecord

              ? "Зберегти зміни"

              : "Зберегти"}

        </button>

      </div>


      {/* =================================================
          ІСТОРІЯ
      ================================================= */}

      <div className="card">

        <div className="section-title-row">

          <h2>

            <BarChart3 size={20} />

            Історія

          </h2>


          {records.length > 0 && (

            <span className="record-count">

              {records.length}

              {" "}

              {records.length === 1
                ? "запис"
                : "записів"}

            </span>

          )}

        </div>


        {records.length === 0 ? (

          <div className="empty-state">

            Ще немає внесених
            результатів.

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    День
                  </th>

                  <th>
                    Дата
                  </th>

                  <th>
                    Початок
                  </th>

                  <th>
                    Факт PnL
                  </th>

                  <th>
                    Кінець
                  </th>

                  <th>
                    ROI
                  </th>

                  <th>
                    Угоди
                  </th>

                  <th>
                    Статус
                  </th>

                  <th>
                    Дії
                  </th>

                </tr>

              </thead>


              <tbody>

                {sortedRecords.map(
                  record => {

                    const profit =
                      Number(
                        record.actualProfit
                      ) || 0;


                    const planned =
                      Number(
                        plan.balance
                      ) *

                      Math.pow(

                        1 +
                        dailyGrowth,

                        Number(
                          record.day
                        )

                      );


                    return (

                      <tr
                        key={
                          record.timestamp
                        }
                      >

                        <td>

                          <strong>
                            {record.day}
                          </strong>

                        </td>


                        <td>

                          {formatDate(
                            record.date
                          )}

                        </td>


                        <td>

                          {formatMoney(
                            record.balanceStart
                          )}

                        </td>


                        <td
                          className={
                            profit >= 0
                              ? "positive"
                              : "negative"
                          }
                        >

                          {profit >= 0
                            ? "+"
                            : ""}

                          {formatMoney(
                            profit
                          )}

                        </td>


                        <td>

                          <strong>

                            {formatMoney(
                              record.balanceEnd
                            )}

                          </strong>

                        </td>


                        <td>

                          {Number(
                            record.roi
                          ).toFixed(
                            2
                          )}

                          %

                        </td>


                        <td>

                          {record.trades ||
                            0}

                        </td>


                        <td>

                          {Number(
                            record.balanceEnd
                          ) >=
                            planned ? (

                            <span className="status success">
                              У плані
                            </span>

                          ) : (

                            <span className="status warning">
                              Нижче плану
                            </span>

                          )}

                        </td>


                        <td>

                          <div className="row-actions">


                            {/* РЕДАГУВАТИ */}

                            <button
                              type="button"
                              className="icon-button edit"
                              title="Редагувати"
                              onClick={() =>
                                startEdit(
                                  record
                                )
                              }
                              disabled={saving}
                            >

                              <Pencil
                                size={17}
                              />

                            </button>


                            {/* ВИДАЛИТИ */}

                            <button
                              type="button"
                              className="icon-button delete"
                              title="Видалити"
                              onClick={() =>
                                handleDelete(
                                  record
                                )
                              }
                              disabled={saving}
                            >

                              <Trash2
                                size={17}
                              />

                            </button>


                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>
      {/* =================================================
    DELETE MODAL
================================================= */}

      {deleteRecord && (

        <div
          className="modal-overlay"
          onMouseDown={e => {

            if (
              e.target === e.currentTarget &&
              !saving
            ) {

              setDeleteRecord(null);

            }

          }}
        >

          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >

            <div className="delete-modal-icon">

              <Trash2 size={24} />

            </div>


            <div className="delete-modal-content">

              <h3 id="delete-modal-title">
                Видалити запис?
              </h3>

              <p>

                Ви дійсно хочете видалити
                результат за

                {" "}

                <strong>
                  День {deleteRecord.day}
                </strong>
                ?

              </p>

              <span>

                Після видалення всі наступні
                дні автоматично перерахуються.

              </span>

            </div>


            <div className="delete-modal-actions">

              <button
                type="button"
                className="modal-cancel-button"
                onClick={() =>
                  setDeleteRecord(null)
                }
                disabled={saving}
              >

                Скасувати

              </button>


              <button
                type="button"
                className="modal-delete-button"
                onClick={
                  confirmDelete
                }
                disabled={saving}
              >

                <Trash2 size={17} />

                {saving
                  ? "Видалення..."
                  : "Видалити"}

              </button>

            </div>

          </div>

        </div>

      )}
    </div>

  );

}