import {
  useEffect,
  useState
} from "react";

import {
  BarChart3,
  RefreshCw,
  Save
} from "lucide-react";

import api from "../api";


const money = (number) => {

  return new Intl.NumberFormat(
    "uk-UA",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(
    Number(number || 0)
  );

};


export default function AnalyticsPage() {

  // ---------------------------------------------------
  // План
  // ---------------------------------------------------

  const [plan, setPlan] =
    useState(null);


  // ---------------------------------------------------
  // Записи
  // ---------------------------------------------------

  const [entries, setEntries] =
    useState([]);


  // ---------------------------------------------------
  // Форма
  // ---------------------------------------------------

  const [form, setForm] =
    useState({
      day: "",
      date: "",
      balanceStart: "",
      actualProfit: "",
      roi: "",
      trades: "",
      notes: ""
    });


  // ---------------------------------------------------
  // Loading
  // ---------------------------------------------------

  const [loading, setLoading] =
    useState(true);


  // ---------------------------------------------------
  // Message
  // ---------------------------------------------------

  const [message, setMessage] =
    useState("");


  // ---------------------------------------------------
  // Load
  // ---------------------------------------------------

  async function load() {

    setLoading(true);
    setMessage("");


    try {

      const [
        recordsData,
        currentPlan
      ] = await Promise.all([

        api.getRecords(),

        api.getPlan()

      ]);


      setEntries(
        Array.isArray(recordsData)
          ? recordsData
          : []
      );


      if (!currentPlan) {

        throw new Error(
          "План не знайдено"
        );

      }


      setPlan(currentPlan);

    } catch (error) {

      console.error(
        "Не вдалося завантажити дані:",
        error
      );


      setMessage(
        "Не вдалося завантажити дані. " +
        "Перевір підключення Google Sheets."
      );

    } finally {

      setLoading(false);

    }

  }


  // ---------------------------------------------------
  // Initial load
  // ---------------------------------------------------

  useEffect(() => {

    load();

  }, []);


  // ---------------------------------------------------
  // Save record
  // ---------------------------------------------------

  async function saveRecord(event) {

    event.preventDefault();


    const balanceStart =
      Number(form.balanceStart);


    const actualProfit =
      Number(form.actualProfit);


    const balanceEnd =
      balanceStart +
      actualProfit;


    setLoading(true);
    setMessage("");


    try {

      await api.saveRecord({

        ...form,

        day:
          Number(form.day),

        balanceStart,

        actualProfit,

        balanceEnd,

        roi:
          Number(form.roi || 0),

        trades:
          Number(form.trades || 0)

      });


      setMessage(
        "День збережено."
      );


      setForm({

        day: "",
        date: "",
        balanceStart: "",
        actualProfit: "",
        roi: "",
        trades: "",
        notes: ""

      });


      // Оновлюємо дані після збереження

      const [
        recordsData,
        currentPlan
      ] = await Promise.all([

        api.getRecords(),

        api.getPlan()

      ]);


      setEntries(
        Array.isArray(recordsData)
          ? recordsData
          : []
      );


      setPlan(
        currentPlan
      );

    } catch (error) {

      console.error(
        "Помилка збереження:",
        error
      );


      setMessage(
        "Помилка збереження. " +
        "Перевір підключення Google Sheets."
      );

    } finally {

      setLoading(false);

    }

  }


  // ---------------------------------------------------
  // PRELOADER
  // ---------------------------------------------------

  if (loading && !plan) {

    return (

      <div className="page-loader">

        <div className="loader-spinner" />

        <span>
          Завантаження аналітики...
        </span>

      </div>

    );

  }


  // ---------------------------------------------------
  // Якщо план не завантажився
  // ---------------------------------------------------

  if (!plan) {

    return (

      <div className="page-loader">

        <span>
          {message ||
            "Не вдалося завантажити дані."}
        </span>

        <button
          className="secondary"
          onClick={load}
        >

          <RefreshCw size={17} />

          Спробувати ще раз

        </button>

      </div>

    );

  }


  // ---------------------------------------------------
  // Sorting
  // ---------------------------------------------------

  const sorted =
    [...entries].sort(
      (a, b) =>
        Number(a.day) -
        Number(b.day)
    );


  const latest =
    sorted[sorted.length - 1];


  const planDay =
    Number(
      latest?.day || 0
    );


  // ---------------------------------------------------
  // Plan balance
  // ---------------------------------------------------

  const dailyGrowth =
    (
      Number(plan.entryPercent) /
      100
    ) *
    (
      Number(plan.roi) /
      100
    );


  const planBalance =
    Number(plan.balance) *
    Math.pow(
      1 + dailyGrowth,
      planDay
    );


  const actualBalance =
    Number(
      latest?.balanceEnd ||
      latest?.balanceStart ||
      plan.balance
    );


  const progress =
    Math.min(
      100,
      Math.max(
        0,
        (
          actualBalance /
          Number(plan.target)
        ) *
        100
      )
    );


  const totalProfit =
    actualBalance -
    Number(plan.balance);


  // ---------------------------------------------------
  // JSX
  // ---------------------------------------------------

  return (

    <>

      <header className="page-head">

        <div>

          <p className="eyebrow">
            Факт
          </p>

          <h1>
            Щоденна аналітика
          </h1>

          <p className="muted">
            Внось фактичні результати
            та порівнюй їх із планом.
          </p>

        </div>


        <button
          className="secondary"
          onClick={load}
          disabled={loading}
        >

          <RefreshCw size={17} />

          {loading
            ? "Оновлення..."
            : "Оновити"}

        </button>

      </header>


      {/* PROGRESS */}

      <section className="progress-card">

        <div className="progress-top">

          <div>

            <span>
              Прогрес до цілі
            </span>

            <b>
              {money(actualBalance)}
              {" / "}
              {money(plan.target)}
              {" "}
              USDT
            </b>

          </div>


          <strong>
            {progress.toFixed(1)}%
          </strong>

        </div>


        <div className="progress">

          <div
            style={{
              width: `${progress}%`
            }}
          />

        </div>


        <div className="mini-stats">

          <span>

            День:

            {" "}

            <b>
              {planDay}
            </b>

          </span>


          <span>

            Загальний PnL:

            {" "}

            <b
              className={
                totalProfit >= 0
                  ? "positive"
                  : "negative"
              }
            >

              {totalProfit >= 0
                ? "+"
                : ""}

              {money(totalProfit)}

              {" "}
              USDT

            </b>

          </span>


          <span>

            Плановий баланс:

            {" "}

            <b>

              {money(planBalance)}
              {" "}
              USDT

            </b>

          </span>

        </div>

      </section>


      {/* FORM */}

      <section className="card form-card">

        <div className="card-title">

          <Save size={19} />

          <h2>
            Внести результат дня
          </h2>

        </div>


        <form
          onSubmit={saveRecord}
        >

          <div className="form-grid">

            <label>

              День

              <input
                required
                type="number"
                min="1"
                value={form.day}
                onChange={(event) =>
                  setForm({
                    ...form,
                    day:
                      event.target.value
                  })
                }
              />

            </label>


            <label>

              Дата

              <input
                required
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    date:
                      event.target.value
                  })
                }
              />

            </label>


            <label>

              Баланс на початку

              <input
                required
                type="number"
                step="0.01"
                value={
                  form.balanceStart
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    balanceStart:
                      event.target.value
                  })
                }
              />

            </label>


            <label>

              Фактичний
              прибуток / збиток

              <input
                required
                type="number"
                step="0.01"
                value={
                  form.actualProfit
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    actualProfit:
                      event.target.value
                  })
                }
              />

            </label>


            <label>

              ROI за день, %

              <input
                type="number"
                step="0.01"
                value={form.roi}
                onChange={(event) =>
                  setForm({
                    ...form,
                    roi:
                      event.target.value
                  })
                }
              />

            </label>


            <label>

              Кількість угод

              <input
                type="number"
                min="0"
                value={form.trades}
                onChange={(event) =>
                  setForm({
                    ...form,
                    trades:
                      event.target.value
                  })
                }
              />

            </label>

          </div>


          <label className="full">

            Коментар / примітка

            <textarea
              rows="3"
              value={form.notes}
              onChange={(event) =>
                setForm({
                  ...form,
                  notes:
                    event.target.value
                })
              }
            />

          </label>


          <button
            className="primary"
            disabled={loading}
          >

            <Save size={17} />

            {loading
              ? "Збереження..."
              : "Зберегти в Google Sheets"}

          </button>

        </form>


        {message && (

          <div className="message">

            {message}

          </div>

        )}

      </section>


      {/* HISTORY */}

      <section className="card table-card">

        <div className="card-title">

          <BarChart3 size={19} />

          <h2>
            Історія
          </h2>

        </div>


        <div className="table-wrap">

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
                  Угод
                </th>

                <th>
                  Статус
                </th>

              </tr>

            </thead>


            <tbody>

              {sorted.map(
                (record, index) => {

                  const plannedBalance =
                    Number(plan.balance) *
                    Math.pow(
                      1 + dailyGrowth,
                      Number(record.day)
                    );


                  const difference =
                    Number(
                      record.balanceEnd
                    ) -
                    plannedBalance;


                  return (

                    <tr key={index}>

                      <td>
                        {record.day}
                      </td>

                      <td>
                        {record.date}
                      </td>

                      <td>
                        {money(
                          record.balanceStart
                        )}
                      </td>

                      <td
                        className={
                          Number(
                            record.actualProfit
                          ) >= 0
                            ? "positive"
                            : "negative"
                        }
                      >

                        {Number(
                          record.actualProfit
                        ) >= 0
                          ? "+"
                          : ""}

                        {money(
                          record.actualProfit
                        )}

                      </td>

                      <td>

                        <b>
                          {money(
                            record.balanceEnd
                          )}
                        </b>

                      </td>

                      <td>
                        {record.roi}%
                      </td>

                      <td>
                        {record.trades}
                      </td>

                      <td>

                        <span
                          className={
                            difference >= 0
                              ? "pill good"
                              : "pill bad"
                          }
                        >

                          {difference >= 0
                            ? "В плані"
                            : "Нижче плану"}

                        </span>

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>


        {!sorted.length && (

          <div className="empty">

            Поки немає записів.
            Додай перший день вище.

          </div>

        )}

      </section>

    </>

  );

}
