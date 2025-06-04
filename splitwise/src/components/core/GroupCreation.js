import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const GroupCreation = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [memberEmails, setMemberEmails] = useState(''); // This input can now be optional
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!groupName.trim()) {
      setError('Group name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!auth.currentUser) {
        throw new Error('You must be logged in to create a group.');
      }

      // Initialize emails array with the current user's email, converted to lowercase
      const emailsToQuery = [auth.currentUser.email.toLowerCase()];

      // If there are additional member emails from the input, process them
      if (memberEmails.trim()) {
        const additionalEmails = memberEmails
          .split(',')
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email);

        // Add unique additional emails to the list to query
        additionalEmails.forEach(email => {
          if (!emailsToQuery.includes(email)) { // Prevent duplicates if current user's email is also in input
            emailsToQuery.push(email);
          }
        });
      }

      // Fetch user UIDs for all collected emails
      const userQuery = query(collection(db, 'users'), where('email', 'in', emailsToQuery));
      const userSnapshot = await getDocs(userQuery);

      const members = [];
      const balance = {};

      userSnapshot.forEach((doc) => {
        const userData = doc.data();
        members.push(userData.uid);
        balance[userData.uid] = 0; // Initialize balance for each member
      });

      // Check if all requested emails were found
      if (members.length !== emailsToQuery.length) {
        // Find which emails were not found for a more descriptive error
        const foundEmails = userSnapshot.docs.map(doc => doc.data().email.toLowerCase());
        const notFoundEmails = emailsToQuery.filter(email => !foundEmails.includes(email));
        throw new Error(`Some email addresses were not found: ${notFoundEmails.join(', ')}. Please ensure they are registered.`);
      }

      // Create group in Firestore
      await addDoc(collection(db, 'groups'), {
        name: groupName,
        members, // Use the UIDs of found members
        balance, // Initial balances
        createdAt: new Date().toISOString(),
      });

      navigate('/groups'); // Redirect after successful creation
    } catch (err) {
      console.error("Error creating group:", err); // Log the full error for debugging
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50 overflow-x-hidden" style={{ fontFamily: 'Inter, Noto Sans, sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#eaedf1] px-10 py-3">
          <div className="flex items-center gap-4 text-[#101418]">
            <div className="size-4">
              {/* Your SVG icon */}
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold">ExpenseTracker</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <button className="h-10 px-2.5 bg-[#eaedf1] rounded-xl font-bold">?</button>
            <div className="bg-cover rounded-full size-10" style={{ backgroundImage: `url("${auth.currentUser?.photoURL || 'https://via.placeholder.com/40'}")` }}></div>
          </div>
        </header>

        {/* Group Creation Form */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="w-full max-w-[512px]">
            <p className="text-[32px] font-bold mb-4">Create a group</p>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Group name</label>
                <input
                  className="w-full h-14 p-[15px] border border-[#d4dbe2] rounded-xl placeholder:text-[#5c728a]"
                  placeholder="e.g. Weekend trip"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Group members (optional, comma-separated emails)</label>
                <input
                  className="w-full h-14 p-[15px] border border-[#d4dbe2] rounded-xl placeholder:text-[#5c728a]"
                  placeholder="e.g. friend1@example.com, friend2@example.com"
                  value={memberEmails}
                  onChange={(e) => setMemberEmails(e.target.value)}
                  // Make this input optional if you want to allow creating with just the current user
                  // Do NOT use 'required' here if you want to allow creating with just yourself
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="h-10 px-4 bg-[#b2cbe5] rounded-xl font-bold disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCreation;