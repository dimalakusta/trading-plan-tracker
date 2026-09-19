import {
    useEffect,
    useState
} from "react";

import {
    Save,
    Settings
} from "lucide-react";

import api from "../api";


export default function SettingsPage() {

    // ---------------------------------------------------
    // План
    // ---------------------------------------------------

    const [plan, setPlan] =
        useState(null);


    // ---------------------------------------------------
    // Loading
    // ---------------------------------------------------

    const [loading, setLoading] =
        useState(true);


    // ---------------------------------------------------
    // Saving
    // ---------------------------------------------------

    const [saving, setSaving] =
        useState(false);


    // ---------------------------------------------------
    // Message
    // ---------------------------------------------------

    const [msg, setMsg] =
        useState("");


    // ---------------------------------------------------
    // Завантаження плану
    // ---------------------------------------------------

    useEffect(() => {

        async function loadPlan() {

            setLoading(true);
            setMsg("");


            try {

                const currentPlan =
                    await api.getPlan();


                if (!currentPlan) {

                    throw new Error(
                        "План не знайдено"
                    );

                }


                setPlan(
                    currentPlan
                );

            } catch (error) {

                console.error(
                    "Не вдалося завантажити план:",
                    error
                );


                setMsg(
                    "Не вдалося завантажити дані " +
                    "з Google Sheets."
                );

            } finally {

                setLoading(false);

            }

        }


        loadPlan();

    }, []);


    // ---------------------------------------------------
    // Збереження
    // ---------------------------------------------------

    async function save() {

        setSaving(true);
        setMsg("");


        try {

            await api.savePlan({

                balance:
                    Number(plan.balance),

                entryPercent:
                    Number(plan.entryPercent),

                leverage:
                    Number(plan.leverage),

                roi:
                    Number(plan.roi),

                target:
                    Number(plan.target)

            });


            // Отримуємо актуальний план
            // назад із Google Sheets

            const updatedPlan =
                await api.getPlan();


            setPlan(
                updatedPlan
            );


            setMsg(
                "Налаштування збережено."
            );

        } catch (error) {

            console.error(
                "Помилка збереження:",
                error
            );


            setMsg(
                "Не вдалося зберегти налаштування."
            );

        } finally {

            setSaving(false);

        }

    }


    // ---------------------------------------------------
    // PRELOADER
    // ---------------------------------------------------

    if (loading) {

        return (

            <div className="page-loader">

                <div className="loader-spinner" />

                <span>
                    Завантаження налаштувань...
                </span>

            </div>

        );

    }


    // ---------------------------------------------------
    // Помилка завантаження
    // ---------------------------------------------------

    if (!plan) {

        return (

            <div className="page-loader">

                <span>
                    {msg ||
                        "Не вдалося завантажити план."}
                </span>

            </div>

        );

    }


    // ---------------------------------------------------
    // JSX
    // ---------------------------------------------------

    return (

        <>

            <header className="page-head">

                <div>

                    <p className="eyebrow">
                        План
                    </p>

                    <h1>
                        Налаштування
                    </h1>

                    <p className="muted">
                        Зміни параметри торгового
                        плану. Дані зберігаються
                        безпосередньо в Google Sheets.
                    </p>

                </div>

            </header>


            <section className="card form-card">

                <div className="card-title">

                    <Settings size={19} />

                    <h2>
                        Торговий план
                    </h2>

                </div>


                <div className="form-grid">

                    <label>

                        Баланс, USDT

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={plan.balance}
                            onChange={(event) =>
                                setPlan({
                                    ...plan,
                                    balance:
                                        event.target.value
                                })
                            }
                        />

                    </label>


                    <label>

                        Вхід, %

                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={
                                plan.entryPercent
                            }
                            onChange={(event) =>
                                setPlan({
                                    ...plan,
                                    entryPercent:
                                        event.target.value
                                })
                            }
                        />

                    </label>


                    <label>

                        Плече, ×

                        <input
                            type="number"
                            min="1"
                            step="0.1"
                            value={
                                plan.leverage
                            }
                            onChange={(event) =>
                                setPlan({
                                    ...plan,
                                    leverage:
                                        event.target.value
                                })
                            }
                        />

                    </label>


                    <label>

                        ROI, %

                        <input
                            type="number"
                            step="0.01"
                            value={
                                plan.roi
                            }
                            onChange={(event) =>
                                setPlan({
                                    ...plan,
                                    roi:
                                        event.target.value
                                })
                            }
                        />

                    </label>


                    <label>

                        Ціль, USDT

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                                plan.target
                            }
                            onChange={(event) =>
                                setPlan({
                                    ...plan,
                                    target:
                                        event.target.value
                                })
                            }
                        />

                    </label>

                </div>


                <button
                    className="primary"
                    onClick={save}
                    disabled={saving}
                >

                    <Save size={17} />

                    {saving
                        ? "Збереження..."
                        : "Зберегти план"}

                </button>


                {msg && (

                    <div className="message">

                        {msg}

                    </div>

                )}

            </section>

        </>

    );

}
