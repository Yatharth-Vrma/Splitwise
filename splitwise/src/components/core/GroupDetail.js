import React from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from 'react-router-dom';



function GroupDetail() {
        const navigate = useNavigate();
  const group = {
    name: "Trip to Paris",
    creator: "Emily Carter",
    members: ["Emily Carter", "Liam Harper"],
    expenses: [
      { id: 1, description: "Dinner", amount: 120, paidBy: "Emily Carter" },
      { id: 2, description: "Museum Tickets", amount: 80, paidBy: "Liam Harper" },
      { id: 3, description: "Taxi", amount: 50, paidBy: "Emily Carter" },
      { id: 4, description: "Coffee", amount: 30, paidBy: "Liam Harper" },
    ],
  };

  return (
        <div className="relative flex min-h-screen flex-col bg-gray-50 overflow-x-hidden" style={{ fontFamily: 'Inter, Noto Sans, sans-serif' }}>
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

        <main className="px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[32px] font-bold text-[#101418]">Trip to Paris</p>
                <p className="text-sm text-[#5c728a]">
                  Created by {group.creator} · {group.members.length} members
                </p>
              </div>
            </div>

            <div className="pb-3 border-b border-[#d4dbe2] flex gap-8 px-4">
              <a className="flex flex-col items-center justify-center border-b-[3px] border-[#b2cbe5] text-[#101418] pb-[13px] pt-4" href="#">
                <p className="text-sm font-bold tracking-[0.015em]">Expenses</p>
              </a>
              <a className="flex flex-col items-center justify-center text-[#5c728a] pb-[13px] pt-4" href="#">
                <p className="text-sm font-bold tracking-[0.015em]">Balances</p>
              </a>
              <a className="flex flex-col items-center justify-center text-[#5c728a] pb-[13px] pt-4" href="#">
                <p className="text-sm font-bold tracking-[0.015em]">Total</p>
              </a>
            </div>

            {/* Expenses List */}
            {group.expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between gap-4 bg-gray-50 px-4 min-h-[72px] py-2"
              >
                <div className="flex flex-col justify-center">
                  <p className="text-base font-medium text-[#101418]">{exp.description}</p>
                  <p className="text-sm text-[#5c728a]">{exp.paidBy} paid ${exp.amount.toFixed(2)}</p>
                </div>
                <div className="shrink-0 text-base text-[#101418]">${exp.amount.toFixed(2)}</div>
              </div>
            ))}

            <div className="flex px-4 py-3 justify-end">
              <button onClick={() => navigate('/add-expense')}className="rounded-full h-10 px-4 bg-[#b2cbe5] text-sm font-bold text-[#101418]">
                Add an expense
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default GroupDetail;
