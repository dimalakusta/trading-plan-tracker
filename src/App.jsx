import {
  Route,
  Routes
} from "react-router-dom";

import Layout
  from "./components/Layout";

import CalculatorPage
  from "./pages/CalculatorPage";

import AnalyticsPage
  from "./pages/AnalyticsPage";

import SettingsPage
  from "./pages/SettingsPage";


export default function App() {

  return (

    <Layout>

      <Routes>

        <Route
          path="/"
          element={
            <CalculatorPage />
          }
        />

        <Route
          path="/analytics"
          element={
            <AnalyticsPage />
          }
        />

        <Route
          path="/settings"
          element={
            <SettingsPage />
          }
        />

      </Routes>

    </Layout>

  );

}