import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function GroupList() {
  const PROFILE_IMG = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      if (!auth.currentUser) {
        setError("Please log in to view groups.");
        setLoading(false);
        return;
      }

      try {
        // Fetch groups
        const q = query(
          collection(db, "groups"),
          where("members", "array-contains", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const groupList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // For each group, fetch transactions and total the amount
        const groupTotals = {};
        for (const group of groupList) {
          const txSnap = await getDocs(
            query(
              collection(db, "transactions"),
              where("groupId", "==", group.id)
            )
          );
          const total = txSnap.docs.reduce(
            (sum, doc) => sum + Number(doc.data().amount || 0),
            0
          );
          groupTotals[group.id] = total;
        }

        // Add total property to each group
        const enrichedGroups = groupList.map((group) => ({
          ...group,
          totalAmount: groupTotals[group.id] || 0,
        }));

        setGroups(enrichedGroups);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div
      className="relative flex min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden" // Use bg-gray-50 from the better styled version
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="min-h-screen bg-slate-50 font-sans">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#e7edf3] px-4 md:px-10 py-3 relative z-10 bg-slate-50">
          <div className="flex items-center gap-4 text-[#0e141b]">
            <svg
              className="w-4 h-4"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                fill="currentColor"
              />
            </svg>
            <h2 className="text-lg font-bold tracking-[-0.015em]">
              ExpenseTracker
            </h2>
          </div>

          {/* Desktop Navigation & User Controls */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-9 text-sm font-medium text-[#0e141b]">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#197ce5] font-semibold" // Adjusted to primary blue
                    : "hover:text-[#197ce5] transition"
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/groups"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#197ce5] font-semibold" // Adjusted to primary blue
                    : "hover:text-[#197ce5] transition"
                }
              >
                Groups
              </NavLink>
              {/* Added Friends link from the other component */}
              <NavLink
                to="/friends"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#197ce5] font-semibold"
                    : "hover:text-[#197ce5] transition"
                }
              >
                Friends
              </NavLink>
              <NavLink
                to="/expense-list"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#197ce5] font-semibold" // Adjusted to primary blue
                    : "hover:text-[#197ce5] transition"
                }
              >
                Expenses
              </NavLink>
            </nav>
            {/* Notification button from the other component */}
            <button className="h-10 px-2.5 flex items-center justify-center gap-2 rounded-full bg-[#e7edf3] font-bold text-sm tracking-[0.015em] text-[#0e141b]">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104A80,80,0,1,0,48,104c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />
              </svg>
            </button>
            <div
    className="w-10 h-10 bg-cover bg-center rounded-full"
    style={{
      backgroundImage: `url("${PROFILE_IMG}")`,
    }}
  />
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <button
            className="md:hidden flex items-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#0e141b]"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            )}
          </button>
        </header>

        {/* Mobile Menu Overlay & Sidebar */}
        <>
          {/* Overlay */}
          <div
            className={`md:hidden fixed inset-0 bg-black z-20 transition-opacity duration-300 ease-in-out
              ${
                isMobileMenuOpen
                  ? "bg-opacity-40"
                  : "bg-opacity-0 pointer-events-none"
              }`}
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <div
            className={`md:hidden fixed top-0 right-0 h-full w-72 bg-white z-30 shadow-2xl flex flex-col
              transform transition-all duration-300 ease-in-out
              ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            {/* Sidebar Header with Close Button */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-[#0e141b]">Menu</h3>
              <button
                onClick={toggleMobileMenu}
                className="p-1 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Close menu"
              >
                <svg
                  className="w-5 h-5 text-slate-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Profile Section (using auth.currentUser) */}
            {auth.currentUser && (
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    className="w-12 h-12 rounded-full border-2 border-[#197ce5] object-cover" // Adjusted border color
                    src={PROFILE_IMG}
                    alt="User Profile"
                  />
                  <div>
                    <p
                      className="text-base font-semibold text-[#0e141b] truncate"
                      title={
                        auth.currentUser?.displayName || auth.currentUser?.email
                      }
                    >
                      {auth.currentUser?.displayName || "User Name"}
                    </p>
                    <p
                      className="text-xs text-slate-500 truncate"
                      title={auth.currentUser?.email}
                    >
                      {auth.currentUser?.email}
                    </p>
                  </div>
                </div>
                {/* Notification button for mobile */}
                <button className="w-full h-9 flex items-center justify-center gap-2 rounded-md bg-slate-100 hover:bg-slate-200 font-medium text-sm text-[#0e141b] transition-colors">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104A80,80,0,1,0,48,104c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />
                  </svg>
                  Notifications
                </button>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-grow px-2 py-2 space-y-1 overflow-y-auto border-t border-slate-200">
              {[
                { to: "/dashboard", label: "Dashboard" },
                { to: "/groups", label: "Groups" },
                { to: "/friends", label: "Friends" }, // Added Friends link
                { to: "/expense-list", label: "Expenses" },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block w-full text-left py-2.5 px-3 rounded-md transition-colors duration-150 text-sm font-medium ${
                      isActive
                        ? "bg-[#e2eaf5] text-[#197ce5] font-semibold" // Adjusted bg and text color
                        : "text-slate-700 hover:bg-slate-100 active:bg-slate-200"
                    }`
                  }
                  onClick={toggleMobileMenu}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Footer/Logout Button */}
            <div className="px-4 py-3 border-t border-slate-200">
              <button className="w-full text-left py-2.5 px-3 rounded-md hover:bg-red-50 hover:text-red-700 text-slate-700 text-sm font-medium transition-colors flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M120,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h64a8,8,0,0,1,0,16H48V208h64A8,8,0,0,1,120,216Zm105.66-90.34a8,8,0,0,0-11.32,0l-48,48a8,8,0,0,0,0,11.32l48,48a8,8,0,0,0,11.32-11.32L181.31,184H224a8,8,0,0,0,0-16H181.31l32.35-32.34A8,8,0,0,0,225.66,125.66Zm-41-50.34a8,8,0,0,0-11.32,0L125.66,123a8,8,0,0,0,0,11.32L173.34,182a8,8,0,0,0,11.32-11.32L140.31,128.34l44.35-44.34A8,8,0,0,0,184.66,75.32Z"></path>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </>

        {/* Groups Section */}
        <div className="px-4 sm:px-6 md:px-10 lg:px-40 py-5 flex justify-center">
          <div className="flex flex-col max-w-[960px] w-full">
            <div className="flex justify-between gap-3 p-4">
              <h2 className="text-[32px] font-bold text-[#0e141b]">
                Your groups
              </h2>
              <button
                onClick={() => navigate("/groups/create")} // Corrected path
                class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#eaedf1] text-[#101418] text-sm font-medium leading-normal"
              >
                New group
              </button>
            </div>
            {error && <p className="text-red-500 text-center p-4">{error}</p>}
            {loading ? (
              <p className="text-center text-[#4e7297] p-4">
                Loading groups...
              </p>
            ) : groups.length === 0 ? (
              <p className="text-center text-[#4e7297] p-4">
                No groups found. Create one!
              </p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex flex-col gap-3 pb-3 cursor-pointer"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    <div
                      className="w-full aspect-[4/3] h-40 bg-center bg-no-repeat bg-cover rounded-lg"
                      style={{
                        backgroundImage: `url('${
                          group.imageUrl ||
                          "https://images.pexels.com/photos/29875053/pexels-photo-29875053/free-photo-of-dramatic-cumulus-clouds-in-blue-sky.jpeg"
                        }')`,
                      }}
                    />
                    <div>
                      <p className="text-base font-medium text-[#0e141b]">
                        {group.name}
                      </p>
                      <p className="text-sm text-[#4e7297]">
                        {group.members?.length || 0} members · ₹
                        {group.totalAmount?.toFixed(2) || "0.00"} total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupList;
