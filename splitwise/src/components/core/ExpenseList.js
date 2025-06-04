import React, { useState } from 'react';
import { NavLink } from "react-router-dom";

const ExpenseList = () => {
  const [expenses] = useState([
    {
      id: 1,
      date: '2024-07-20',
      description: 'Dinner at The Italian Place',
      category: 'Food',
      amount: '$60.00',
      paidBy: 'Sarah',
      split: 'Equally'
    },
    {
      id: 2,
      date: '2024-07-19',
      description: 'Movie tickets',
      category: 'Entertainment',
      amount: '$30.00',
      paidBy: 'David',
      split: 'Equally'
    },
    {
      id: 3,
      date: '2024-07-18',
      description: 'Grocery shopping',
      category: 'Groceries',
      amount: '$120.00',
      paidBy: 'Emily',
      split: 'By percentage'
    },
    {
      id: 4,
      date: '2024-07-17',
      description: 'Gasoline',
      category: 'Transportation',
      amount: '$45.00',
      paidBy: 'Michael',
      split: 'Equally'
    },
    {
      id: 5,
      date: '2024-07-16',
      description: 'Coffee',
      category: 'Food',
      amount: '$15.00',
      paidBy: 'Sarah',
      split: 'Equally'
    },
    {
      id: 6,
      date: '2024-07-15',
      description: 'Lunch',
      category: 'Food',
      amount: '$40.00',
      paidBy: 'David',
      split: 'Equally'
    },
    {
      id: 7,
      date: '2024-07-14',
      description: 'Concert tickets',
      category: 'Entertainment',
      amount: '$100.00',
      paidBy: 'Emily',
      split: 'By percentage'
    },
    {
      id: 8,
      date: '2024-07-13',
      description: 'Parking',
      category: 'Transportation',
      amount: '$20.00',
      paidBy: 'Michael',
      split: 'Equally'
    },
    {
      id: 9,
      date: '2024-07-12',
      description: 'Snacks',
      category: 'Food',
      amount: '$10.00',
      paidBy: 'Sarah',
      split: 'Equally'
    },
    {
      id: 10,
      date: '2024-07-11',
      description: 'Brunch',
      category: 'Food',
      amount: '$50.00',
      paidBy: 'David',
      split: 'Equally'
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);

  const handleAddExpense = () => {
    console.log('Add expense clicked');
  };

  const handleFilterChange = (filterType) => {
    console.log(`Filter changed: ${filterType}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

        {/* Main Content */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Title and Add Button */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#101418] tracking-light text-[32px] font-bold leading-tight min-w-72">All Expenses</p>
              <button
                onClick={handleAddExpense}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#eaedf1] text-[#101418] text-sm font-medium leading-normal"
              >
                <span className="truncate">Add an expense</span>
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 p-3 flex-wrap pr-4">
              <button
                onClick={() => handleFilterChange('categories')}
                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-2"
              >
                <p className="text-[#101418] text-sm font-medium leading-normal">All categories</p>
                <div className="text-[#101418]" data-icon="CaretDown" data-size="20px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
              </button>
              <button
                onClick={() => handleFilterChange('dates')}
                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-2"
              >
                <p className="text-[#101418] text-sm font-medium leading-normal">All dates</p>
                <div className="text-[#101418]" data-icon="CaretDown" data-size="20px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
              </button>
              <button
                onClick={() => handleFilterChange('sort')}
                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-2"
              >
                <p className="text-[#101418] text-sm font-medium leading-normal">Sort</p>
                <div className="text-[#101418]" data-icon="CaretDown" data-size="20px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
              </button>
            </div>

            {/* Expenses Table */}
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-xl border border-[#d4dbe2] bg-gray-50">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-[#101418] w-[400px] text-sm font-medium leading-normal">Date</th>
                      <th className="px-4 py-3 text-left text-[#101418] w-[400px] text-sm font-medium leading-normal">Description</th>
                      <th className="px-4 py-3 text-left text-[#101418] w-60 text-sm font-medium leading-normal">Category</th>
                      <th className="px-4 py-3 text-left text-[#101418] w-[400px] text-sm font-medium leading-normal">Amount</th>
                      <th className="px-4 py-3 text-left text-[#101418] w-[400px] text-sm font-medium leading-normal">Paid by</th>
                      <th className="px-4 py-3 text-left text-[#101418] w-[400px] text-sm font-medium leading-normal">Split</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-t border-t-[#d4dbe2]">
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#5c728a] text-sm font-normal leading-normal">
                          {expense.date}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#101418] text-sm font-normal leading-normal">
                          {expense.description}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#eaedf1] text-[#101418] text-sm font-medium leading-normal w-full">
                            <span className="truncate">{expense.category}</span>
                          </button>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#5c728a] text-sm font-normal leading-normal">
                          {expense.amount}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#5c728a] text-sm font-normal leading-normal">
                          {expense.paidBy}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#5c728a] text-sm font-normal leading-normal">
                          {expense.split}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Responsive Table Styling */}
              <style>{`
                @container(max-width:120px){.table-08e67ab6-2a7a-45e0-8814-33d92bdd5a61-column-120{display: none;}}
                @container(max-width:240px){.table-08e67ab6-2a7a-45e0-8814-33d92bdd5a61-column-240{display: none;}}
                @container(max-width:360px){.table-08e67ab6-2a7a-45e0-8814-33d92bdd5a61-column-360{display: none;}}
                @container(max-width:480px){.table-08e67ab6-2a7a-45e0-8814-33d92bdd5a61-column-480{display: none;}}
                @container(max-width:600px){.table-08e67ab6-2a7a-45e0-8814-33d92bdd5a61-column-600{display: none;}}
                @container(max-width:720px){.table-08e67ab6-2a7a-45e0-8814-33d92bdd5a61-column-720{display: none;}}
              `}</style>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center p-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex size-10 items-center justify-center"
              >
                <div className="text-[#101418]" data-icon="CaretLeft" data-size="18px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                  </svg>
                </div>
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`text-sm font-${currentPage === page ? 'bold' : 'normal'} leading-normal flex size-10 items-center justify-center text-[#101418] rounded-full ${
                    currentPage === page ? 'bg-[#eaedf1]' : ''
                  }`}
                >
                  {page}
                </button>
              ))}
              <span className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#101418] rounded-full">
                ...
              </span>
              <button
                onClick={() => handlePageChange(10)}
                className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#101418] rounded-full"
              >
                10
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === 10}
                className="flex size-10 items-center justify-center"
              >
                <div className="text-[#101418]" data-icon="CaretRight" data-size="18px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;