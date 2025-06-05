import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebase"; // CORRECTED: Adjusted path to firebase.js again
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const panelRef = useRef(null); // Ref to the notification panel for click-outside detection

  // Toggles the visibility of the notification panel.
  const togglePanel = () => setIsOpen(!isOpen);

  // Effect to handle clicks outside the notification panel to close it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the panel is open and the click occurred outside the panel (and not on the button that opens it), close the panel.
      // The toggle button is assumed to be outside the 'panelRef' element.
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Empty dependency array ensures this effect runs once on mount and cleans up on unmount

  // Effect to fetch notifications when the panel opens or the user changes.
  useEffect(() => {
    // Only proceed with fetching if the panel is open and a user is authenticated.
    if (!isOpen || !auth.currentUser) {
      setNotifications([]); // Clear notifications if panel is closed or no user
      setLoading(false);    // Ensure loading state is false if not fetching
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true); // Set loading to true while fetching data
      setError("");       // Clear any previous error messages

      try {
        // Create a Firestore query to get notifications for the current user.
        // We use 'where' to filter by 'userId'.
        // 'orderBy' is commented out as per previous instructions to avoid needing additional Firestore indexes.
        // If you enable orderBy, ensure you create a composite index in Firestore for 'userId' (Equality) and 'createdAt' (Descending).
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", auth.currentUser.uid)
          // orderBy("createdAt", "desc") // Uncomment if you have the Firestore index for it
        );

        const snapshot = await getDocs(q); // Execute the query
        const notificationList = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() })) // Map document data to include ID
          // Client-side sort if Firestore orderBy is not used.
          // This sorts by 'createdAt' in descending order (newest first).
          .sort((a, b) => {
              // Safely convert Firestore Timestamp to JavaScript Date for comparison.
              // Fallback to new Date(0) if createdAt is missing or invalid.
              const dateA = a.createdAt && typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(0);
              const dateB = b.createdAt && typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(0);
              return dateB.getTime() - dateA.getTime(); // Descending order
          });
        setNotifications(notificationList); // Update state with fetched notifications
      } catch (err) {
        // Catch and set any errors during the fetch process
        setError("Failed to load notifications: " + err.message);
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false); // Set loading to false once fetching is complete (success or error)
      }
    };

    fetchNotifications(); // Call the fetch function
  }, [isOpen]); // Effect re-runs if 'isOpen' or 'auth.currentUser' changes

  // Function to mark a specific notification as read in Firestore and update local state.
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId); // Get reference to the notification document
      await updateDoc(notificationRef, { read: true }); // Update the 'read' field to true in Firestore
      
      // Optimistically update the local state to reflect the change immediately
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      // Catch and set any errors during the update process
      setError("Failed to mark notification as read: " + err.message);
      console.error("Error marking notification as read:", err);
    }
  };

  // Calculates the number of unread notifications.
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={panelRef}> {/* Attach ref to the outermost container of the panel */}
      {/* Notification Button: Toggles the panel and displays unread count */}
      <button
        onClick={togglePanel}
        className="h-10 px-2.5 flex items-center justify-center gap-2 rounded-full bg-[#e7edf3] font-bold text-sm tracking-tight text-[#0e141b] relative"
      >
        {/* Bell icon SVG */}
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
          <path
            d="M221.8,175.94C216.25,166.38,208,139.33,208,104A80,80,0,1,0,48,104c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"
          />
        </svg>
        {/* Unread notification badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel Content (conditionally rendered based on 'isOpen' state) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-[#e7edf3]">
          <div className="p-4 border-b border-[#e7edf3]">
            <h3 className="text-lg font-semibold text-[#0e141b]">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {/* Conditional rendering for loading, error, or no notifications */}
            {loading ? (
              <p className="p-4 text-[#4e7297] text-sm">Loading...</p>
            ) : error ? (
              <p className="p-4 text-red-500 text-sm">{error}</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-[#4e7297] text-sm">No notifications found.</p>
            ) : (
              // Map through notifications and render each one
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-[#e7edf3] last:border-b-0 flex justify-between items-start ${
                    notification.read ? "bg-slate-50" : "bg-white" // Style based on read status
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-[#0e141b]">{notification.message}</p>
                    <p className="text-xs text-[#4e7297]">
                      {/* Safely display createdAt date, converting Firestore Timestamp to Date */}
                      {notification.createdAt && typeof notification.createdAt.toDate === 'function'
                        ? new Date(notification.createdAt.toDate()).toLocaleString()
                        : 'N/A'} {/* Fallback if timestamp is not valid */}
                    </p>
                  </div>
                  {/* Mark as read button, only shown if notification is unread */}
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-[#197ce5] text-xs font-medium hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;