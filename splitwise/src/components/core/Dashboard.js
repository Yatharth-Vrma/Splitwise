import React from "react";
import { NavLink } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="flex items-center justify-between border-b border-[#e7edf3] px-10 py-3">
        <div className="flex items-center gap-4 text-[#0e141b]">
          <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none">
            <path
              fill="currentColor"
              d="M39.475 21.6262C40.358 21.4363 ... 4.41189 29.2403Z"
            />
          </svg>
          <h2 className="text-lg font-bold tracking-[-0.015em]">ExpenseTracker</h2>
        </div>
        <div className="flex items-center gap-8">
          <nav className="flex gap-9 text-sm font-medium">
  <NavLink
    to="/dashboard"
    className={({ isActive }) =>
      isActive ? "text-blue-600 font-semibold" : "hover:text-blue-500 transition"
    }
  >
    Dashboard
  </NavLink>
  <NavLink
    to="/groups"
    className={({ isActive }) =>
      isActive ? "text-blue-600 font-semibold" : "hover:text-blue-500 transition"
    }
  >
    Groups
  </NavLink>
  <NavLink
    to="/friends"
    className={({ isActive }) =>
      isActive ? "text-blue-600 font-semibold" : "hover:text-blue-500 transition"
    }
  >
    Friends
  </NavLink>
  <NavLink
    to="/expense-list"
    className={({ isActive }) =>
      isActive ? "text-blue-600 font-semibold" : "hover:text-blue-500 transition"
    }
  >
    Expenses
  </NavLink>
</nav>
          <button className="h-10 px-2.5 flex items-center justify-center gap-2 rounded-full bg-[#e7edf3] font-bold text-sm tracking-[0.015em]">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.8,175.94C216.25,...Z" />
            </svg>
          </button>
          <div
            className="w-10 h-10 bg-cover bg-center rounded-full"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXu...")',
            }}
          />
        </div>
      </header>

      <main className="px-40 py-5 flex justify-center">
        <div className="w-full max-w-[960px]">
          <section className="p-4">
            <h1 className="text-[32px] font-bold text-[#0e141b]">Group Expenses</h1>
            <p className="text-sm text-[#4e7297]">View and manage shared expenses within your groups.</p>
          </section>

          <section className="px-4 pt-5">
            <h2 className="text-[22px] font-bold text-[#0e141b]">Group Balances</h2>
            <div className="flex gap-4 p-4 rounded-xl">
              <div className="flex-1">
                <p className="text-sm text-[#4e7297]">Total Balance</p>
                <p className="text-base font-bold text-[#0e141b]">$250.00</p>
                <p className="text-sm text-[#4e7297]">You are owed $250.00 in total.</p>
              </div>
              <div
                className="aspect-video w-full bg-cover bg-center rounded-xl flex-1"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCcNMlsUR...")',
                }}
              />
            </div>
          </section>

          <section className="px-4 pt-5">
            <h2 className="text-[22px] font-bold text-[#0e141b]">Recent Expenses</h2>
            {/* You can create a component like <ExpenseItem /> and map through items for better structure */}
            <div className="space-y-2">
              {/* Expense Items Here */}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
