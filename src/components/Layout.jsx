import {
  Link,
  NavLink
} from "react-router-dom";

import {
  BarChart3,
  Calculator,
  Settings,
  Target,
  TrendingUp
} from "lucide-react";


export default function Layout({ children }) {

  return (

    <div className="app-shell">

      <aside className="sidebar">

        <Link
          to="/"
          className="brand"
        >

          <div className="brand-icon">
            <TrendingUp size={21} />
          </div>


          <div>

            <b>
              Trading Plan
            </b>

            <span>
              Tracker
            </span>

          </div>

        </Link>


        <nav>

          <NavLink
            to="/"
            end
          >

            <Calculator size={18} />

            Розрахунок

          </NavLink>


          <NavLink to="/analytics">

            <BarChart3 size={18} />

            Аналітика

          </NavLink>


          <NavLink to="/settings">

            <Settings size={18} />

            Налаштування

          </NavLink>

        </nav>


        <div className="sidebar-note">

          <Target size={18} />

          <span>
            План → факт → контроль прогресу
          </span>

        </div>

      </aside>


      <main className="main">

        {children}

      </main>

    </div>

  );
}