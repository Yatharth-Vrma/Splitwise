import React, { useState, useEffect } from "react";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import { auth, db } from "../../firebase"; // CORRECTED: Adjusted path to firebase.js
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

function GroupDetail() {
  const PROFILE_IMG = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  const navigate = useNavigate();
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [tab, setTab] = useState("expenses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userNames, setUserNames] = useState({}); // uid -> displayName
  const [showInviteForm, setShowInviteForm] = useState(false); // Control invite form visibility
  const [inviteEmail, setInviteEmail] = useState(""); // Email input
  const [inviteError, setInviteError] = useState(""); // Invite-specific error
  const [inviteSuccess, setInviteSuccess] = useState(""); // Invite success message

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  function calculateBalances(groupMembers, transactions) {
    const balances = {};
    groupMembers.forEach((uid) => (balances[uid] = 0));
    transactions.forEach((txn) => {
      if (txn.type === "settlement") {
        balances[txn.from] += txn.amount;
        balances[txn.to] -= txn.amount;
      } else if (txn.participants && Array.isArray(txn.participants)) {
        const paidBy = txn.paidBy;
        const total = Number(txn.amount) || 0;
        balances[paidBy] += total;
        txn.participants.forEach((p) => {
          balances[p.uid] -= Number(p.amount) || 0;
        });
      }
    });
    return balances;
  }

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!auth.currentUser || !groupId) {
        setError("Invalid group or user not logged in.");
        setLoading(false);
        return;
      }

      try {
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);
        if (!groupSnap.exists()) throw new Error("Group not found.");
        const groupData = { id: groupSnap.id, ...groupSnap.data() };

        // Fetch expenses
        const expensesQuery = query(
          collection(db, "transactions"),
          where("groupId", "==", groupId)
        );
        const expensesSnap = await getDocs(expensesQuery);
        const expensesList = expensesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch user display names for all group members
        let names = {};
        if (groupData.members && groupData.members.length) {
          const usersRef = collection(db, "users");
          // Fetch users in batches of 10 for 'in' query
          for (let i = 0; i < groupData.members.length; i += 10) {
            const batch = groupData.members.slice(i, i + 10);
            const userQuery = query(usersRef, where("uid", "in", batch));
            const userSnaps = await getDocs(userQuery);
            userSnaps.forEach((doc) => {
              const data = doc.data();
              names[data.uid] = data.name || data.displayName || data.uid;
            });
          }
        }

        setGroup(groupData);
        setExpenses(expensesList);
        setUserNames(names);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]); // Dependency array includes groupId to refetch when it changes

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");

    if (!inviteEmail) {
      setInviteError("Please enter an email address.");
      return;
    }

    try {
      // Find user by email
      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", inviteEmail)
      );
      const userSnap = await getDocs(usersQuery);

      if (userSnap.empty) {
        setInviteError("No user found with this email.");
        return;
      }

      const userDoc = userSnap.docs[0];
      const userId = userDoc.id; // User ID is usually the document ID in 'users' collection

      if (group.members.includes(userId)) {
        setInviteError("User is already a member of this group.");
        return;
      }

      // Update group members
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: [...group.members, userId],
      });

      // Update local state
      setGroup((prev) => ({
        ...prev,
        members: [...prev.members, userId],
      }));
      setUserNames((prev) => ({
        ...prev,
        [userId]: userDoc.data().name || userDoc.data().displayName || userId,
      }));

      setInviteSuccess("Member added successfully!");
      setInviteEmail("");
      setShowInviteForm(false);

      // Optionally, create a notification for the new member (requires a 'notifications' collection setup)
      // Example:
      // await addDoc(collection(db, 'notifications'), {
      //   userId: userId,
      //   message: `You have been added to group "${group.name}"`,
      //   read: false,
      //   createdAt: serverTimestamp() // Import serverTimestamp from 'firebase/firestore'
      // });
    } catch (err) {
      setInviteError("Failed to add member: " + err.message);
      console.error(err);
    }
  };

  if (loading)
    return <div className="text-center p-4 text-[#4e7297]">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (!group) return null; // Render nothing if group data is not available yet

  return (
    <div
      className="relative flex min-h-screen flex-col bg-slate-50 overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="min-h-screen bg-slate-50 font-sans">
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
                    ? "text-[#197ce5] font-semibold"
                    : "hover:text-[#197ce5] transition"
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/groups"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#197ce5] font-semibold"
                    : "hover:text-[#197ce5] transition"
                }
              >
                Groups
              </NavLink>
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
                    ? "text-[#197ce5] font-semibold"
                    : "hover:text-[#197ce5] transition"
                }
              >
                Expenses
              </NavLink>
            </nav>
            <button className="h-10 px-2.5 flex items-center justify-center gap-2 rounded-full bg-[#e7edf3] text-[#0e141b] font-semibold">
              {" "}
              {/* Changed text color to #0e141b as per design */}
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 256 256" // Corrected viewBox
                className="text-[#0e141b]" // Changed text color to #0e141b as per design
              >
                <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104A80,80,0,1,0,48,104c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />
              </svg>
            </button>
            <div
              className="w-[40px] h-[40px] bg-cover bg-center rounded-full"
              style={{
                backgroundImage: `url("${PROFILE_IMG}")`,
              }}
            ></div>
          </div>

          <button
            className="md:hidden flex items-center px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#0e141b]"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round" // Corrected: camelCase
                  strokeLinejoin="round" // Corrected: camelCase
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-6 w-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round" // Corrected: camelCase
                  strokeLinejoin="round" // Corrected: camelCase
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            )}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        <div
          className={`md:!hidden fixed inset-0 bg-black z-20 transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "bg-opacity-40"
              : "bg-opacity-0 pointer-events-none"
          }`}
          onClick={toggleMobileMenu}
          aria-hidden="true"
        ></div>
        {/* Mobile Menu Panel */}
        <div
          className={`md:hidden fixed top-0 right-0 h-full w-72 bg-white z-30 shadow-2xl flex flex-col transform transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-[#0e141b]">Menu</h3>
            <button
              onClick={toggleMobileMenu} // CORRECTED: Direct function call
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
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {auth.currentUser && (
            <div className="px-4 py-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  className="w-12 h-12 rounded-full border-2 border-[#197ce5] object-cover"
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
                    isActive
                      ? "bg-[#e2eaf5] text-[#197ce5] font-semibold"
                      : "text-slate-700 hover:bg-slate-100 active:bg-slate-200"
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
              onClick={async () => {
                await auth.signOut();
                navigate("/login");
              }}
              className="w-full text-left py-2.5 px-3 rounded-md hover:bg-red-50 hover:text-red-700 text-slate-700 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M120,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h64a8,8,0,0,1,0,16H48V208h64A8,8,0,0,1,120,216Zm105.66-90.34a8,8,0,0,0-11.32,0l-48,48a8,8,0,0,0,0,11.32l48,48a8,8,0,0,0,11.32-11.32L181.31,184H224a8,8,0,0,0,0-16H181.31l32.35-32.34A8,8,0,0,0,225.66,125.66Zm-41-50.34a8,8,0,0,0-11.32,0L125.66,123a8,8,0,0,0,0,11.32L173.34,182a8,8,0,0,0,11.32-11.32L140.31,128.34l44.35-44.34A8,0,0,0,184.66,75.32Z"></path>
              </svg>
              Logout
            </button>
          </div>
        </div>

        <main className="px-4 py-5 md:px-40 flex flex-1 justify-center">
          <div className="flex flex-col max-w-[960px] w-full">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <h2 className="text-[32px] font-bold text-[#0e141b]">
                  {group.name}
                </h2>
                <p className="text-sm text-[#4e7297]">
                  Created by {auth.currentUser?.displayName} ·{" "}
                  {group.members.length} members
                </p>
              </div>
            </div>
            <div className="pb-3 border-b border-[#e7edf3] grid grid-cols-3 gap-2 px-4 md:flex md:gap-8">
              <button
                className={`flex flex-col items-center justify-center pb-[13px] pt-4 text-sm font-bold tracking-[0.015em] ${
                  tab === "expenses"
                    ? "border-b-[3px] border-[#197ce5] text-[#0e141b]"
                    : "text-[#4e7297]"
                }`}
                onClick={() => setTab("expenses")}
              >
                Expenses
              </button>
              <button
                className={`flex flex-col items-center justify-center pb-[13px] pt-4 text-sm font-bold tracking-[0.015em] ${
                  tab === "balances"
                    ? "border-b-[3px] border-[#197ce5] text-[#0e141b]"
                    : "text-[#4e7297]"
                }`}
                onClick={() => setTab("balances")}
              >
                Balances
              </button>
              <button
                className={`flex flex-col items-center justify-center pb-[13px] pt-4 text-sm font-bold tracking-[0.015em] ${
                  tab === "total"
                    ? "border-b-[3px] border-[#197ce5] text-[#0e141b]"
                    : "text-[#4e7297]"
                }`}
                onClick={() => setTab("total")}
              >
                Total
              </button>
            </div>
            {tab === "expenses" && (
              <div>
                {expenses.filter(
                  (exp) => !exp.type || exp.type !== "settlement"
                ).length === 0 ? (
                  <p className="text-center text-[#4e7297] p-4">
                    No expenses yet.
                  </p>
                ) : (
                  expenses
                    .filter((exp) => !exp.type || exp.type !== "settlement")
                    .map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between gap-4 bg-slate-50 px-4 min-h-[72px] py-2"
                      >
                        <div className="flex flex-col justify-center">
                          <p className="text-base font-medium text-[#0e141b]">
                            {exp.description}
                          </p>
                          <p className="text-sm text-[#4e7297]">
                            Paid by {userNames[exp.paidBy] || exp.paidBy} · $
                            {exp.amount?.toFixed
                              ? exp.amount.toFixed(2)
                              : Number(exp.amount || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="shrink-0 text-base text-[#0e141b]">
                          $
                          {exp.amount?.toFixed
                            ? exp.amount.toFixed(2)
                            : Number(exp.amount || 0).toFixed(2)}
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
            {tab === "balances" && (
              <div className="p-4">
                {/* Balances List (unchanged) */}
                {group.members &&
                  expenses.length > 0 &&
                  (() => {
                    const balances = calculateBalances(group.members, expenses);
                    return Object.entries(balances).map(([uid, amount]) => (
                      <div key={uid} className="flex justify-between py-2">
                        <p className="text-base text-[#0e141b]">
                          {userNames[uid] || uid}
                        </p>
                        <p
                          className={`text-base ${
                            amount >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          ₹{Math.abs(amount).toFixed(2)}{" "}
                          {amount >= 0 ? "owed" : "owes"}
                        </p>
                      </div>
                    ));
                  })()}
                {(!expenses.length || !group.members) && (
                  <p className="text-[#4e7297] text-sm">
                    No balances available.
                  </p>
                )}

                {/* Settle Transactions Dropdown */}
                <details className="mt-6">
                  <summary className="cursor-pointer bg-[#e7edf3] py-2 px-4 rounded font-bold text-[#197ce5]">
                    Settle Transactions
                  </summary>
                  <div className="mt-3">
                    {expenses.filter((txn) => txn.type === "settlement")
                      .length === 0 ? (
                      <p className="text-[#4e7297] text-sm px-4">
                        No settlements yet.
                      </p>
                    ) : (
                      expenses
                        .filter((txn) => txn.type === "settlement")
                        .map((txn) => (
                          <div
                            key={txn.id}
                            className="p-3 mb-2 bg-[#f7fafc] rounded border border-[#e7edf3] text-[#0e141b]"
                          >
                            <span className="font-semibold">
                              {userNames[txn.from] || txn.from}
                            </span>{" "}
                            settled with{" "}
                            <span className="font-semibold">
                              {userNames[txn.to] || txn.to}
                            </span>{" "}
                            for{" "}
                            <span className="font-bold text-[#197ce5]">
                              ₹
                              {txn.amount?.toFixed
                                ? txn.amount.toFixed(2)
                                : Number(txn.amount || 0).toFixed(2)}
                            </span>{" "}
                            on{" "}
                            {txn.createdAt && txn.createdAt.toDate
                              ? txn.createdAt.toDate().toLocaleDateString()
                              : txn.createdAt?.seconds
                              ? new Date(
                                  txn.createdAt.seconds * 1000
                                ).toLocaleDateString()
                              : ""}
                          </div>
                        ))
                    )}
                  </div>
                </details>
              </div>
            )}
            {tab === "total" && (
              <div className="p-4">
                <p className="text-base text-[#0e141b]">
                  Total expenses: $
                  {expenses
                    .reduce((sum, exp) => sum + exp.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex flex-col px-4 py-3 gap-2 md:flex-row md:justify-end md:gap-4">
              <button
                onClick={() => navigate(`/groups/${groupId}/add-expense`)}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#b2cbe5] text-[#101418] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                Add an expense
              </button>
              <button
                onClick={() => navigate(`/groups/${groupId}/settle-up`)}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#b2cbe5] text-[#101418] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                Settle up
              </button>
              <button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#b2cbe5] text-[#101418] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                Add Member
              </button>
            </div>
            {showInviteForm && (
              <div className="px-4 py-3">
                <form
                  onSubmit={handleInviteMember}
                  className="flex flex-col gap-3"
                >
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="h-10 px-3 rounded-md border border-[#e7edf3] text-[#0e141b] text-sm focus:outline-none focus:ring-2 focus:ring-[#197ce5]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-4 bg-[#197ce5] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                    >
                      Invite
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInviteForm(false);
                        setInviteEmail("");
                        setInviteError("");
                        setInviteSuccess("");
                      }}
                      className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]"
                    >
                      Cancel
                    </button>
                  </div>
                  {inviteError && (
                    <p className="text-sm text-red-500">{inviteError}</p>
                  )}
                  {inviteSuccess && (
                    <p className="text-sm text-green-500">{inviteSuccess}</p>
                  )}
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default GroupDetail;
