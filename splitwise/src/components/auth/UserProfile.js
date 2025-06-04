import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase';
import { updateProfile, updateEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Load user data on mount
  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
      setName(auth.currentUser.displayName || '');
      setEmail(auth.currentUser.email || '');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Handle profile picture upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    try {
      const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL });
      await setDoc(doc(db, 'users', auth.currentUser.uid), { photoURL }, { merge: true });
      setUser({ ...auth.currentUser, photoURL });
      setMessage('Profile picture updated successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      await updateEmail(auth.currentUser, email);
      await setDoc(doc(db, 'users', auth.currentUser.uid), { name, email }, { merge: true });
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  // Navigate to settings (placeholder for future SettingsPage)
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf3] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0e141b]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em]">ExpenseTracker</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-[#0e141b] text-sm font-medium leading-normal" href="/dashboard">Dashboard</a>
              <a className="text-[#0e141b] text-sm font-medium leading-normal" href="/groups">Groups</a>
              <a className="text-[#0e141b] text-sm font-medium leading-normal" href="/friends">Friends</a>
              <a className="text-[#0e141b] text-sm font-medium leading-normal" href="/activity">Activity</a>
            </div>
            <button
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#e7edf3] text-[#0e141b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
            >
              <div className="text-[#0e141b]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path
                    d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"
                  />
                </svg>
              </div>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: `url(${user?.photoURL || 'https://via.placeholder.com/40'})` }}
            />
          </div>
        </header>
        <div className="px-4 sm:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0e141b] tracking-tight text-[32px] font-bold leading-tight min-w-72">Your Profile</p>
            </div>
            <div className="flex p-4">
              <div className="flex w-full flex-col gap-4 items-center">
                <div className="flex gap-4 flex-col items-center">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                    style={{ backgroundImage: `url(${user?.photoURL || 'https://via.placeholder.com/128'})` }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-sm text-[#4e7297] mt-2"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">{user?.displayName || 'User'}</p>
                    <p className="text-[#4e7297] text-base font-normal leading-normal text-center">{user?.email || 'No email'}</p>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Account</h2>
            {message && <p className="text-green-500 text-center px-4 py-2">{message}</p>}
            {error && <p className="text-red-500 text-center px-4 py-2">{error}</p>}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-14 justify-between">
                <label className="flex flex-col flex-1">
                  <p className="text-[#0e141b] text-base font-normal leading-normal">Name</p>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-10 p-2 text-base font-normal leading-normal"
                  />
                </label>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-14 justify-between">
                <label className="flex flex-col flex-1">
                  <p className="text-[#0e141b] text-base font-normal leading-normal">Email</p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-10 p-2 text-base font-normal leading-normal"
                  />
                </label>
              </div>
              <div className="flex px-4 py-3">
                <button
                  type="submit"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#197ce5] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Save Changes</span>
                </button>
              </div>
            </form>
            <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-14 justify-between cursor-pointer" onClick={handleSettingsClick}>
              <p className="text-[#0e141b] text-base font-normal leading-normal flex-1 truncate">Settings</p>
              <div className="shrink-0">
                <div className="text-[#0e141b] flex size-7 items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path
                      d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;