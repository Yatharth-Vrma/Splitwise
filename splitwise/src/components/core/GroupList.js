import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from "react-router-dom";


function GroupList() {
  const navigate = useNavigate();
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

        {/* Groups Section */}
        <div className="px-40 flex justify-center py-5">
          <div className="flex flex-col max-w-[960px] w-full">
            <div className="flex justify-between gap-3 p-4">
              <p className="text-[32px] font-bold">Your groups</p>
              <button onClick={() => navigate('/create-group')}
className="h-8 px-4 bg-[#eaedf1] rounded-xl text-sm font-medium">New group</button>
            </div>

            {/* Group Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
              {/* Example Card */}
              {[
                {
                  name: "Trip to Paris",
                  members: 4,
                  total: 1200,
                  image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6ueEg..."
                },
                {
                  name: "Weekend Getaway",
                  members: 3,
                  total: 800,
                  image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSDZ5..."
                },
                {
                  name: "Apartment Expenses",
                  members: 2,
                  total: 500,
                  image: "https://lh3.googleusercontent.com/aida-public/AB6AXuByY3LA..."
                },
                {
                  name: "Ski Trip",
                  members: 5,
                  total: 1500,
                  image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGG43..."
                }
              ].map((group, i) => (
                <div key={i} className="flex flex-col gap-3 pb-3">
                  <div
                    className="w-full aspect-square bg-center bg-no-repeat bg-cover rounded-xl"
                    style={{ backgroundImage: `url('${group.image}')` }}
                  />
                  <div>
                    <p className="text-base font-medium">{group.name}</p>
                    <p className="text-sm text-[#5c728a]">{group.members} members · ${group.total} total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupList;
