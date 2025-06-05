import React, { useState, useEffect } from "react";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

const PROFILE_IMG = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; // Flaticon free profile icon

function ExpenseForm() {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [participants, setParticipants] = useState([]);
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [splitMode, setSplitMode] = useState("equal"); // "equal" | "custom"
  const [customSplits, setCustomSplits] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser || !groupId) {
        setError("Invalid group or user not logged in.");
        setLoading(false);
        return;
      }
      try {
        // Fetch group
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);
        if (!groupSnap.exists()) throw new Error("Group not found.");
        const groupData = { id: groupSnap.id, ...groupSnap.data() };
        setGroup(groupData);

        // Fetch users
        const userPromises = groupData.members.map(async (uid) => {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          return { uid, ...(userSnap.exists() ? userSnap.data() : {}) };
        });
        const userData = await Promise.all(userPromises);
        const userMap = Object.fromEntries(userData.map((u) => [u.uid, u]));
        setUsers(userMap);
        setParticipants(groupData.members);
        setCustomSplits(
          groupData.members.reduce((acc, uid) => {
            acc[uid] = ""; // Empty for now
            return acc;
          }, {})
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // When participants change, reset custom split fields
  useEffect(() => {
    setCustomSplits((prev) =>
      participants.reduce((acc, uid) => {
        acc[uid] = prev[uid] || "";
        return acc;
      }, {})
    );
  }, [participants]);

  // Utility: sum of custom splits
  const getCustomSplitSum = () => {
    let sum = 0;
    for (const uid of participants) {
      let val = parseFloat(customSplits[uid]);
      if (!isNaN(val)) sum += val;
    }
    return sum;
  };

  const handleCustomSplitChange = (uid, value) => {
    setCustomSplits((prev) => ({
      ...prev,
      [uid]: value,
    }));
  };

  const handleSplitModeChange = (val) => {
    setSplitMode(val);
    // If switching back to equal, clear custom splits
    if (val === "equal") {
      setCustomSplits(
        participants.reduce((acc, uid) => {
          acc[uid] = "";
          return acc;
        }, {})
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!group || participants.length === 0)
      return setError("No participants selected");
    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amount) || amountNum <= 0) throw new Error("Invalid amount");

      let participantsData;
      if (splitMode === "equal") {
        const share = amountNum / participants.length;
        participantsData = participants.map((uid) => ({
          uid,
          amount: parseFloat(share.toFixed(2)),
        }));
      } else if (splitMode === "custom") {
        // Validate custom splits
        let sum = 0;
        for (const uid of participants) {
          const val = parseFloat(customSplits[uid]);
          if (isNaN(val) || val < 0)
            throw new Error("Invalid custom split amount");
          sum += val;
        }
        // Allow a small rounding error
        if (Math.abs(sum - amountNum) > 0.01)
          throw new Error("Custom splits must sum to total amount");

        participantsData = participants.map((uid) => ({
          uid,
          amount: parseFloat(customSplits[uid] || "0"),
        }));
      }

      // Create transaction
      const transaction = {
        groupId,
        amount: amountNum,
        description,
        category,
        paidBy: paidBy,
        participants: participantsData,
        createdAt: Timestamp.fromDate(date ? new Date(date) : new Date()),
      };
      await addDoc(collection(db, "transactions"), transaction);

      // Update group balances
      const balanceUpdate = { ...group.balance };
      participantsData.forEach(({ uid, amount }) => {
        balanceUpdate[uid] = (balanceUpdate?.[uid] || 0) - amount;
      });
      balanceUpdate[paidBy] = (balanceUpdate?.[paidBy] || 0) + amountNum;
      await updateDoc(doc(db, "groups", groupId), { balance: balanceUpdate });

      navigate(`/groups/${groupId}`);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleParticipantChange = (uid) => {
    setParticipants((prev) =>
      prev.includes(uid) ? prev.filter((p) => p !== uid) : [...prev, uid]
    );
  };

  if (loading)
    return <div className="text-center p-4 text-[#4e7297]">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (!group) return null;

  return (
    <div
      className="relative flex min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="min-h-screen bg-slate-50 font-sans">
        <header className="flex items-center justify-between border-b border-[#e7edf3] px-4 py-3 md:px-10">
          <div className="flex items-center gap-4 text-[#0e141b]">
            <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none">
              <path
                fill="currentColor"
                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
              />
            </svg>
            <h2 className="text-lg font-bold tracking-[-0.015em]">
              ExpenseTracker
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-8">
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
              <NavLink
                to={`/groups/${groupId}/settle-up`}
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "hover:text-blue-500 transition"
                }
              >
                Settle Up
              </NavLink>
            </nav>
            <button className="h-10 px-2.5 flex items-center justify-center gap-2 rounded-full bg-[#e7edf3] font-bold text-sm tracking-[0.015em]">
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

        {/* Mobile Sidebar/Overlay */}
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

            {/* Profile Section (using PROFILE_IMG) */}
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

            {/* Navigation */}
            <nav className="flex-grow px-2 py-2 space-y-1 overflow-y-auto border-t border-slate-200">
              {[
                { to: "/dashboard", label: "Dashboard" },
                { to: "/groups", label: "Groups" },
                { to: "/friends", label: "Friends" },
                { to: "/expense-list", label: "Expenses" },
                { to: `/groups/${groupId}/settle-up`, label: "Settle Up" },
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

            {/* Footer/Logout Button */}
            <div className="px-4 py-3 border-t border-slate-200">
              <button
                className="w-full text-left py-2.5 px-3 rounded-md hover:bg-red-50 hover:text-red-700 text-slate-700 text-sm font-medium transition-colors flex items-center gap-2"
                onClick={async () => {
                  await auth.signOut();
                  navigate("/login");
                }}
              >
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

        {/* Expense Form */}
        <form
          onSubmit={handleSubmit}
          className="px-4 py-5 sm:px-6 md:px-40 flex flex-1 justify-center"
        >
          <div className="flex flex-col w-full max-w-[512px] py-5">
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
                  step="0.01"
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
                  {group.members.map((uid) => (
                    <option key={uid} value={uid}>
                      {users[uid]?.name || users[uid]?.displayName || uid}{" "}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {/* Split Mode */}
            <div className="flex flex-wrap gap-4 px-4 py-3">
              <span className="text-base font-medium text-[#101418] pb-2">
                Split mode:
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    checked={splitMode === "equal"}
                    onChange={() => handleSplitModeChange("equal")}
                    className="form-radio text-blue-600"
                  />
                  <span className="text-base text-[#101418]">Equally</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    checked={splitMode === "custom"}
                    onChange={() => handleSplitModeChange("custom")}
                    className="form-radio text-blue-600"
                  />
                  <span className="text-base text-[#101418]">Custom</span>
                </label>
              </div>
            </div>
            {/* Split With / Custom Amounts */}
            <div className="flex flex-col gap-4 px-4 py-3">
              <label className="flex flex-col w-full">
                <p className="text-base font-medium text-[#101418] pb-2">
                  Split with
                </p>
                {group.members.map((uid) => (
                  <div
                    key={uid}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={participants.includes(uid)}
                        onChange={() => handleParticipantChange(uid)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                        disabled={
                          splitMode === "custom" && participants.length <= 1
                        }
                      />
                      <span className="text-base text-[#101418]">
                        {users[uid]?.name || users[uid]?.displayName || uid}{" "}
                      </span>
                    </div>
                    {splitMode === "custom" && participants.includes(uid) && (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="ml-0 sm:ml-2 w-full sm:w-28 h-10 rounded border border-[#b2cbe5] bg-gray-50 px-2 text-base text-[#101418] focus:ring focus:ring-blue-200 mt-2 sm:mt-0"
                        value={customSplits[uid]}
                        onChange={(e) =>
                          handleCustomSplitChange(uid, e.target.value)
                        }
                        placeholder="0.00"
                        required
                      />
                    )}
                  </div>
                ))}
                {splitMode === "custom" && (
                  <div className="text-xs text-gray-600 mt-1">
                    <span>
                      Total split: {getCustomSplitSum().toFixed(2)} /{" "}
                      {amount || "0.00"}
                    </span>
                    {amount &&
                      Math.abs(getCustomSplitSum() - parseFloat(amount)) >
                        0.01 && (
                        <span className="text-red-600 ml-2">
                          (Must total {amount})
                        </span>
                      )}
                  </div>
                )}
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
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
            {/* Save/Cancel */}
            <div className="flex flex-col gap-2 px-4 py-3">
              <button
                type="submit"
                className="rounded-full h-10 px-4 bg-[#b2cbe5] text-sm font-bold text-[#101418] w-full"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => navigate(`/groups/${groupId}`)}
                className="rounded-full h-10 px-4 bg-[#e7edf3] text-sm font-bold text-[#101418] w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;