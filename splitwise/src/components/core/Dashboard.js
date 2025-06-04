import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState({ owed: 0, owes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setError("Please log in to view the dashboard.");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        // Fetch user data
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists()
          ? userSnap.data()
          : { displayName: currentUser.displayName || "User", email: currentUser.email || "No email" };
        setUser({
          name: userData.displayName,
          email: userData.email,
          profilePictureUrl: currentUser.photoURL || "https://via.placeholder.com/40",
        });

        // Fetch groups
        const groupQuery = query(
          collection(db, "groups"),
          where("members", "array-contains", currentUser.uid)
        );
        const groupSnapshot = await getDocs(groupQuery);
        const groupList = groupSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupList);

        // Fetch recent transactions
        const transactionQuery = query(
          collection(db, "transactions"),
          where("participants", "array-contains", { uid: currentUser.uid })
        );
        const transactionSnapshot = await getDocs(transactionQuery);
        const transactionList = transactionSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 5); // Limit to 5 recent expenses
        setExpenses(transactionList);

        // Calculate balance (placeholder logic, adjust as per your data structure)
        let owed = 0, owes = 0;
        transactionList.forEach((t) => {
          const userParticipant = t.participants.find((p) => p.uid === currentUser.uid);
          if (t.paidBy === currentUser.uid) {
            owed += t.amount - (userParticipant?.amount || 0);
          } else {
            owes += userParticipant?.amount || 0;
          }
        });
        setBalance({ owed: owed.toFixed(2), owes: owes.toFixed(2) });
      } catch (err) {
        setError("Failed to load dashboard: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      setError("Failed to log out: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center p-4 text-[#4e7297]">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#e7edf3] px-4 md:px-10 py-3 bg-slate-50">
        <div className="flex items-center gap-4 text-[#0e141b]">
          <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8571 25.2301C38.6798 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8571C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30 974.4 24.7574 35.2817 23.5037C36.9657 22.4689 38.4051 21.8562 39.475 21.6262ZM4.41189 29.24L18.7595 43.5882C19.8811 44.7098 21.4025 44.9179 22.74 15.7896C24.0582 44.6593 25.44 43.1634 44.9722 43.429C4.9051 42.05 33.26 43.5666 36.4142 36.4142C34.5666 33.2618 42.05 29.9051 43.429 44.9722C3.1634 25.44 44.8582 43.0582 44.7896 22.74C4.9179 21.4031 44.7098 19.8815 43.5882 18.7599L29.24 44.41188C27.8531 23.0242 25.8538 3.02568 24.2634 3.36771C22.6647 3.72865 20.7333 4.419 18.64 5.74797C15.4647 21.1872 13.986 9.16 11.586 11.586C9.086 12.986 7.16 15.4647 5.697 17.64C4.419 20.9333 3.66465 23.6647 3.36771 25.441C3.02568 25.8538 3.02422 27.8531 4.41188 29.24Z"
              fill="currentColor"
            />
          </svg>
          <h2 className="text-lg font-bold tracking-[-0.015em]">ExpenseTracker</h2>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-9 text-sm font-medium text-[#0e141b]">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "text-[#197ce5] font-semibold" : "hover:text-[#197ce5] transition"
            }>
              Dashboard
            </NavLink>
            <NavLink
              to="/groups"
              className={({ isActive }) =>
                isActive ? "text-[#197ce5] font-semibold" : "hover:text-[#197ce5] transition"
            }>
              Groups
            </NavLink>
            <NavLink
              to="/friends"
              className={({ isActive }) =>
                isActive ? "text-[#197ce5] font-semibold" : "hover:text-[#197ce5] transition"
            }>
              Friends
            </NavLink>
            <NavLink
              to="/expense-list"
              className={({ isActive }) =>
                isActive ? "text-[#197ce5] font-semibold" : "hover:text-[#197ce5] transition"
            }>
              Expenses
            </NavLink>
          </nav>
          <button className="h-10 px-2.5 flex items-center justify-center gap-2 rounded-full bg-[#e7edf3] font-bold text-sm font-medium tracking-tight text-[#0e141b]">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path
                d="M221.8,175.94C216.25,166.38,208,139.33,208,104A80,80,0,1,0,48,104c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"
              />
            </svg>
          </button>
          <div
            className="w-10 h-10 bg-cover bg-center rounded-full"
            style={{ backgroundImage: `url("${user.profilePictureUrl}")` }}
          />
        </div>

        <button
          className="md:hidden flex items-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#0e141b]"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/>
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay & Sidebar */}
      <div
        className={`md:hidden fixed inset-0 bg-black z-20 transition-opacity duration-300 ease-in-out
                    ${isMobileMenuOpen ? "bg-opacity-40" : "bg-opacity-0 pointer-events-none"}`}
        onClick={toggleMobileMenu}
        aria-hidden="true"
      />
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-white z-30 shadow-2xl flex flex-col
               transform transition-all duration-300 ease-in-out
               ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-[#0e141b]">Menu</h3>
          <button
            onClick={toggleMobileMenu}
            className="p-1 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover"
              src={user.profilePictureUrl}
              alt="User Profile"
            />
            <div>
              <p className="text-base font-semibold text-[#0e141b] truncate" title={user.name}>
                {user.name}
              </p>
              <p className="text-xs text-slate-500 truncate" title={user.email}>
                {user.email}
              </p>
            </div>
          </div>
          <button className="w-full h-9 flex items-center justify-center gap-2 rounded-md bg-slate-100 hover:bg-slate-200 font-medium text-sm text-[#0e141b] transition-colors">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path
                d="M221.8,175.94C216.25,166.38,208,139.33,208,104A80,80,0,1,0,48,104c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"
              />
            </svg>
            Notifications
          </button>
        </div>

        <nav className="flex-grow px-2 py-2 space-y-1 overflow-y-auto border-t border-slate-200">
          {[
            { to: "/dashboard", label: "Dashboard" },
            { to: "/groups", label: "Groups" },
            { to: "/friends", label: "Friends" },
            { to: "/expense-list", label: "Expenses" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block w-full text-left py-2.5 px-3 rounded-md transition-colors duration-150 text-sm font-medium ${
                  isActive ? "bg-blue-100 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-100 active:bg-slate-200"
                }`
              }
              onClick={toggleMobileMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full text-left py-2.5 px-3 rounded-md hover:bg-red-50 hover:text-red-700 text-slate-700 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path
                d="M120,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h64a8,8,0,0,1,0,16H48V208h64A8,8,0,0,1,120,216Zm105.66-90.34a8,8,0,0,0-11.32,0l-48,48a8,8,0,0,0,0,11.32l48,48a8,8,0,0,0,11.32-11.32L181.31,184H224a8,8,0,0,0,0-16H181.31l32.35-32.34A8,8,0,0,0,225.66,125.66Zm-41-50.34a8,8,0,0,0-11.32,0L125.66,123a8,8,0,0,0,0,11.32L173.34,182a8,8,0,0,0,11.32-11.32L140.31,128.34l44.35-44.34A8,8,0,0,0,184.66,75.32Z"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 md:px-10 lg:px-40 py-5 flex justify-center">
        <div className="w-full max-w-[960px]">
          <section className="p-4 flex flex-wrap justify-between gap-3">
            <div>
              <h1 className="text-[32px] font-bold text-[#0e141b]">Group Expenses</h1>
              <p className="text-sm text-[#4e7297]">View and manage shared expenses within your groups.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/groups")}
                className="h-8 px-4 flex items-center justify-center rounded-full bg-[#e7edf3] text-[#0e141b] text-sm font-medium"
              >
                Create Group
              </button>
              <button
                onClick={() => navigate("/groups")}
                className="h-8 px-4 flex items-center justify-center rounded-full bg-[#197ce5] text-white text-sm font-medium"
              >
                Add Expense
              </button>
            </div>
          </section>

          <section className="px-4 pt-5">
            <h2 className="text-[22px] font-bold text-[#0e141b]">Group Balances</h2>
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl">
              <div className="flex-1">
                <p className="text-sm text-[#4e7297]">Total Balance</p>
                <p className="text-base font-bold text-[#0e141b]">
                  {balance.owed - balance.owes >= 0
                    ? `+$${Math.abs(balance.owed - balance.owes)}`
                    : `-$${Math.abs(balance.owed - balance.owes)}`}
                </p>
                <p className="text-sm text-[#4e7297]">
                  You are owed ${balance.owed} and owe ${balance.owes}.
                </p>
              </div>
              <div
                className="aspect-video w-full sm:w-1/2 md:w-1/3 bg-cover bg-center rounded-xl"
                style={{ backgroundImage: `url("${user.profilePictureUrl}")` }}
              />
            </div>
          </section>

          <section className="px-4 pt-5">
            <h2 className="text-[22px] font-bold text-[#0e141b]">Your Groups</h2>
            <div className="space-y-2">
              {groups.length === 0 ? (
                <p className="text-sm text-[#4e7297] p-4">No groups found. Create one to get started!</p>
              ) : (
                groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between border-b border-[#e7edf3] last:border-b-0"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-12">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                          <path
                            d="M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40A16,16,0,0,0,24,48V208a16,16,0,0,0,16,16H132.69a15.86,15.86,0,0,0,11.31-4.69L243.31,120A16,16,0,0,0,243.31,136Zm-110.62,8h-64v-32h64Z"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                          {group.name}
                        </p>
                        <p className="text-[#4e7297] text-sm font-normal leading-normal line-clamp-2">
                          {group.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="px-4 pt-5">
            <h2 className="text-[22px] font-bold text-[#0e141b]">Recent Expenses</h2>
            <div className="space-y-2">
              {expenses.length === 0 ? (
                <p className="text-sm text-[#4e7297] p-4">No recent expenses found.</p>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between border-b border-[#e7edf3] last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-12">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                          <path
                            d="M72,88V40a8,8,0,0,1,16,0V88a8,8,0,0,1-16,0ZM216,40V224a8,8,0,0,1-16,0V176H152a8,8,0,0,1-8-8,268.75,268.75,0,0,1,7.22-56.88c9.78-40.49,28.32-67.63,53.63-78.47A8,8,0,0,1,216,40ZM200,53.9c-32.17,24.57-38.47,84.42-39.7,106.1H200ZM119.89,38.69a8,8,0,1,0-15.78,2.63L112,88.63a32,32,0,0,1-64,0l7.88-47.31a8,8,0,1,0-15.78-2.63l-8,48A8.17,8.17,0,0,0,32,88a48.07,48.07,0,0,0,40,47.32V224a8,8,0,0,0,16,0V135.32A48.07,48.07,0,0,0,128,88a8.17,8.17,0,0,0-.11-1.31Z"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                          {expense.category || "Other"}
                        </p>
                        <p className="text-[#4e7297] text-sm font-normal leading-normal line-clamp-2">
                          {expense.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <p className="text-[#0e141b] text-base font-normal leading-normal">
                        ${Number(expense.amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;