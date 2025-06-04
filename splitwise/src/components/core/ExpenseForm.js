import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function ExpenseForm() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitWith, setSplitWith] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newExpense = {
      amount: parseFloat(amount),
      description,
      paidBy,
      splitWith,
      date,
      category,
    };

    console.log("New Expense:", newExpense);

    // Clear form
    setAmount("");
    setDescription("");
    setPaidBy("");
    setSplitWith("");
    setDate("");
    setCategory("");
  };

  return (
    <div
      className="relative flex min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="min-h-screen bg-slate-50 font-sans">
        <header className="flex items-center justify-between border-b border-[#e7edf3] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0e141b]">
            <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none">
              <path
                fill="currentColor"
                d="M39.475 21.6262C40.358 21.4363 ... 4.41189 29.2403Z"
              />
            </svg>
            <h2 className="text-lg font-bold tracking-[-0.015em]">
              ExpenseTracker
            </h2>
          </div>
          <div className="flex items-center gap-8">
            <nav className="flex gap-9 text-sm font-medium">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "hover:text-blue-500 transition"
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/groups"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "hover:text-blue-500 transition"
                }
              >
                Groups
              </NavLink>
              <NavLink
                to="/friends"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "hover:text-blue-500 transition"
                }
              >
                Friends
              </NavLink>
              <NavLink
                to="/expense-list"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "hover:text-blue-500 transition"
                }
              >
                Expenses
              </NavLink>
            </nav>
            <button className="h-10 px-2.5 flex items-center justify-center gap-2 rounded-full bg-[#e7edf3] font-bold text-sm tracking-[0.015em]">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-40 flex flex-1 justify-center py-5"
        >
          <div className="flex flex-col w-[512px] max-w-[512px] py-5">
            <p className="text-[#101418] text-[32px] font-bold px-4 pb-4">
              Add Expense
            </p>

            {/* Amount */}
            <div className="flex flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col w-full">
                <p className="text-base font-medium text-[#101418] pb-2">
                  Amount
                </p>
                <input
                  type="number"
                  placeholder="0.00"
                  className="form-input h-14 rounded-xl border border-[#d4dbe2] bg-gray-50 p-[15px] text-base placeholder-[#5c728a] text-[#101418]"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Description */}
            <div className="flex flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col w-full">
                <p className="text-base font-medium text-[#101418] pb-2">
                  Description
                </p>
                <input
                  type="text"
                  placeholder="Enter a description"
                  className="form-input h-14 rounded-xl border border-[#d4dbe2] bg-gray-50 p-[15px] text-base placeholder-[#5c728a] text-[#101418]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Paid By */}
            <div className="flex flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col w-full">
                <p className="text-base font-medium text-[#101418] pb-2">
                  Paid by
                </p>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="form-input h-14 rounded-xl border border-[#d4dbe2] bg-gray-50 p-[15px] text-base text-[#101418]"
                  required
                >
                  <option value="">Select person</option>
                  <option value="Emily Carter">Emily Carter</option>
                  <option value="Liam Harper">Liam Harper</option>
                </select>
              </label>
            </div>

            {/* Split With */}
            <div className="flex flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col w-full">
                <p className="text-base font-medium text-[#101418] pb-2">
                  Split
                </p>
                <select
                  value={splitWith}
                  onChange={(e) => setSplitWith(e.target.value)}
                  className="form-input h-14 rounded-xl border border-[#d4dbe2] bg-gray-50 p-[15px] text-base text-[#101418]"
                  required
                >
                  <option value="">Select member</option>
                  <option value="Emily Carter">Emily Carter</option>
                  <option value="Liam Harper">Liam Harper</option>
                </select>
              </label>
            </div>

            {/* Date */}
            <div className="flex flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col w-full">
                <p className="text-base font-medium text-[#101418] pb-2">
                  Date
                </p>
                <input
                  type="date"
                  className="form-input h-14 rounded-xl border border-[#d4dbe2] bg-gray-50 p-[15px] text-base text-[#101418]"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Category */}
            <div className="flex flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col w-full">
                <p className="text-base font-medium text-[#101418] pb-2">
                  Category
                </p>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input h-14 rounded-xl border border-[#d4dbe2] bg-gray-50 p-[15px] text-base text-[#101418]"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </label>
            </div>

            {/* Save Button */}
            <div className="flex px-4 py-3">
              <button
                onClick={() => navigate("/group")}
                type="submit"
                className="rounded-full h-10 px-4 bg-[#b2cbe5] text-sm font-bold text-[#101418] flex-1"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
