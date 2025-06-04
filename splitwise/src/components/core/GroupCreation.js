// src/components/GroupCreation.js
import React from 'react';
import { useNavigate } from 'react-router-dom';


const GroupCreation = () => {
      const navigate = useNavigate();
  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50 overflow-x-hidden" style={{ fontFamily: 'Inter, Noto Sans, sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#eaedf1] px-10 py-3">
          <div className="flex items-center gap-4 text-[#101418]">
            <div className="size-4">
              {/* Your SVG icon */}
            </div>
            <h2 className="text-lg font-bold">ExpenseTracker</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <button className="h-10 px-2.5 bg-[#eaedf1] rounded-xl font-bold">?</button>
            <div className="bg-cover rounded-full size-10" style={{ backgroundImage: 'url("your-image-url")' }}></div>
          </div>
        </header>

        {/* Group Creation Form */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="w-full max-w-[512px]">
            <p className="text-[32px] font-bold mb-4">Create a group</p>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Group name</label>
              <input
                className="w-full h-14 p-[15px] border border-[#d4dbe2] rounded-xl placeholder:text-[#5c728a]"
                placeholder="e.g. Weekend trip"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Group members</label>
              <input
                className="w-full h-14 p-[15px] border border-[#d4dbe2] rounded-xl placeholder:text-[#5c728a]"
                placeholder="Enter members by email or name"
              />
            </div>

            <div className="flex justify-end">
              <button onClick={() => navigate('/groups')} className="h-10 px-4 bg-[#b2cbe5] rounded-xl font-bold">Create group</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCreation;
