import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Calculator,
  WalletCards
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


export default function CalculatorPage() {

  // ---------------------------------------------------
  // Параметри без значень за замовчуванням
  // ---------------------------------------------------

  const [balance, setBalance] =
    useState(null);

  const [entryPercent, setEntryPercent] =
    useState(null);

  const [leverage, setLeverage] =
    useState(null);

  const [roi, setRoi] =
    useState(null);

  const [target, setTarget] =
    useState(null);

  const [days, setDays] =
    useState(100);


  // ---------------------------------------------------
  // Завантаження
  // ---------------------------------------------------

  const [loading, setLoading] =
    useState(true);


  // ---------------------------------------------------
  // Статус збереження
  // ---------------------------------------------------

  const [saving, setSaving] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState("");


  // ---------------------------------------------------
  // Завантаження плану з Google Sheets
  // ---------------------------------------------------

  useEffect(() => {

    async function loadPlan() {

      setLoading(true);


      try {

        const plan =
          await api.getPlan();


        if (!plan) {

          throw new Error(
            "План не знайдено"
          );

        }


        setBalance(
          Number(plan.balance)
        );

        setEntryPercent(
          Number(plan.entryPercent)
        );

        setLeverage(
          Number(plan.leverage)
        );

        setRoi(
          Number(plan.roi)
        );

        setTarget(
          Number(plan.target)
        );

      } catch (error) {

        console.error(
          "Не вдалося завантажити план:",
          error
        );

        setSaveMessage(
          "Не вдалося завантажити план."
        );

      } finally {

        setLoading(false);

      }

    }


    loadPlan();

  }, []);


  // ---------------------------------------------------
  // Автоматичне збереження
  // ---------------------------------------------------

  useEffect(() => {

    // Не зберігаємо нічого,
    // поки дані ще завантажуються.

    if (loading) {
      return;
    }


    // Не зберігаємо, якщо план
    // ще не завантажився.

    if (
      balance === null ||
      entryPercent === null ||
      leverage === null ||
      roi === null ||
      target === null
    ) {
      return;
    }


    const timer =
      setTimeout(async () => {

        setSaving(true);
        setSaveMessage("");


        try {

          await api.savePlan({

            balance:
              Number(balance),

            entryPercent:
              Number(entryPercent),

            leverage:
              Number(leverage),

            roi:
              Number(roi),

            target:
              Number(target)

          });


          setSaveMessage(
            "Збережено"
          );

        } catch (error) {

          console.error(
            "Помилка збереження:",
            error
          );


          setSaveMessage(
            "Помилка збереження"
          );

        } finally {

          setSaving(false);

        }

      }, 500);


    return () => {

      clearTimeout(timer);

    };

  }, [
    loading,
    balance,
    entryPercent,
    leverage,
    roi,
    target
  ]);


  // ---------------------------------------------------
  // Розрахунок
  // ---------------------------------------------------

  const rows = useMemo(() => {

    if (
      balance === null ||
      entryPercent === null ||
      leverage === null ||
      roi === null ||
      target === null
    ) {

      return [];

    }


    const result = [];

    let current =
      Number(balance) || 0;


    for (
      let day = 0;
      day <= Number(days || 0);
      day++
    ) {

      const margin =
        current *
        (Number(entryPercent) / 100);


      const position =
        margin *
        Number(leverage);


      const profit =
        margin *
        (Number(roi) / 100);


      const endBalance =
        current + profit;


      result.push({

        day,

        startBalance:
          current,

        margin,

        position,

        profit,

        endBalance,

        targetReached:
          current >= Number(target)

      });


      if (
        current >= Number(target)
      ) {

        break;

      }


      current += profit;

    }


    return result;

  }, [
    balance,
    entryPercent,
    leverage,
    roi,
    target,
    days
  ]);


  // ---------------------------------------------------
  // День досягнення цілі
  // ---------------------------------------------------

  const reached =
    rows.find(
      (row) =>
        row.startBalance >=
        Number(target)
    );


  // ---------------------------------------------------
  // PRELOADER
  // ---------------------------------------------------

  if (loading) {

    return (

      <div className="page-loader">

        <div className="loader-spinner" />

        <span>
          Завантаження плану...
        </span>

      </div>

    );

  }


  // ---------------------------------------------------
  // PAGE
  // ---------------------------------------------------

  return (

    <>

      <header className="page-head">

        <div>

          <p className="eyebrow">
            Планування
          </p>

          <h1>
            Калькулятор торгового плану
          </h1>

          <p className="muted">
            Задай параметри — таблиця
            автоматично покаже баланс
            по кожному дню.
          </p>

        </div>

      </header>


      {/* STATISTICS */}

      <section className="grid stats">

        <div className="stat">

          <span>
            Стартовий баланс
          </span>

          <b>
            {money(balance)} USDT
          </b>

        </div>


        <div className="stat">

          <span>
            Ціль
          </span>

          <b>
            {money(target)} USDT
          </b>

        </div>


        <div className="stat">

          <span>
            Приріст балансу / день
          </span>

          <b>

            {money(
              (
                Number(balance) *
                Number(entryPercent) /
                100
              ) *
              Number(roi) /
              100
            )}

            {" "}
            USDT

          </b>

          <small>
            на стартовому балансі
          </small>

        </div>


        <div className="stat highlight">

          <span>
            Орієнтовний день цілі
          </span>

          <b>

            {reached
              ? `День ${reached.day}`
              : "Не досягнуто"}

          </b>

        </div>

      </section>


      {/* PARAMETERS */}

      <section className="card form-card">

        <div className="card-title">

          <WalletCards size={19} />

          <h2>
            Параметри
          </h2>

        </div>


        <div className="form-grid">

          <label>

            Баланс, USDT

            <input
              type="number"
              min="0"
              value={balance}
              onChange={(event) =>
                setBalance(
                  event.target.value
                )
              }
            />

          </label>


          <label>

            Вхід, % балансу

            <input
              type="number"
              min="0"
              max="100"
              value={entryPercent}
              onChange={(event) =>
                setEntryPercent(
                  event.target.value
                )
              }
            />

          </label>


          <label>

            Плече, ×

            <input
              type="number"
              min="1"
              value={leverage}
              onChange={(event) =>
                setLeverage(
                  event.target.value
                )
              }
            />

          </label>


          <label>

            Закриття, ROI %

            <input
              type="number"
              min="-100"
              value={roi}
              onChange={(event) =>
                setRoi(
                  event.target.value
                )
              }
            />

          </label>


          <label>

            Ціль, USDT

            <input
              type="number"
              min="0"
              value={target}
              onChange={(event) =>
                setTarget(
                  event.target.value
                )
              }
            />

          </label>


          <label>

            Макс. днів

            <input
              type="number"
              min="1"
              max="1000"
              value={days}
              onChange={(event) =>
                setDays(
                  event.target.value
                )
              }
            />

          </label>

        </div>


        <div className="formula">

          <b>
            Логіка:
          </b>{" "}

          маржа = баланс ×{" "}
          {entryPercent}%

          {" · "}

          позиція = маржа ×{" "}
          {leverage}×

          {" · "}

          прибуток = маржа ×{" "}
          {roi}%

          {" · "}

          новий баланс =
          баланс + прибуток.

        </div>


        <div className="message">

          {saving
            ? "Збереження..."
            : saveMessage}

        </div>

      </section>


      {/* TABLE */}

      <section className="card table-card">

        <div className="card-title">

          <Calculator size={19} />

          <h2>
            Прогноз по днях
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
                  Баланс на початку
                </th>

                <th>
                  Маржа
                </th>

                <th>
                  Позиція
                </th>

                <th>
                  Прибуток
                </th>

                <th>
                  Баланс після
                </th>

              </tr>

            </thead>


            <tbody>

              {rows.map((row) => (

                <tr
                  key={row.day}
                  className={
                    row.startBalance >=
                    Number(target)
                      ? "goal-row"
                      : ""
                  }
                >

                  <td>
                    {row.day+1}
                  </td>

                  <td>
                    {money(
                      row.startBalance
                    )}
                  </td>

                  <td>
                    {money(
                      row.margin
                    )}
                  </td>

                  <td>
                    {money(
                      row.position
                    )}
                  </td>

                  <td className="positive">

                    +
                    {money(
                      row.profit
                    )}

                  </td>

                  <td>

                    <b>
                      {money(
                        row.endBalance
                      )}
                    </b>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {!reached && (

          <div className="warning">

            За задану кількість днів
            ціль не досягнута.
            Збільш «Макс. днів».

          </div>

        )}

      </section>

    </>

  );

}