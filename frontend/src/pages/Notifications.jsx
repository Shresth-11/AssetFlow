import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Check } from "lucide-react";

export const Notifications = () => {
  const { apiFetch } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch("/notifications");
      setNotifications(data.notifications || []);
    } catch (err) {
      showToast("error", err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      showToast("success", "Notification marked as read");
    } catch (err) {
      showToast("error", err.message || "Failed to update notification");
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast("success", "All notifications marked as read");
    } catch (err) {
      showToast("error", err.message || "Failed to update notifications");
    }
  };

  const getRelativeTime = (isoString) => {
    const diff = new Date().getTime() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getFilteredNotifications = () => {
    return notifications.filter((n) => {
      if (activeFilter === "All") return true;
      const msg = n.message.toLowerCase();
      if (activeFilter === "Alerts") {
        return n.type === "alert" || n.type === "warning" || msg.includes("overdue") || msg.includes("discrepancy");
      }
      if (activeFilter === "Approvals") {
        return msg.includes("approve") || msg.includes("assigned") || msg.includes("transfer");
      }
      if (activeFilter === "Bookings") {
        return msg.includes("booking") || msg.includes("confirmed") || msg.includes("slot");
      }
      return true;
    });
  };

  const filteredNotifs = getFilteredNotifications();

  return (
    <div className="card animate-fade" style={{ backgroundColor: "#FFFFFF", padding: "28px", minHeight: "65vh" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--border-color)", paddingBottom: "18px", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            🔔 Notifications Board
          </h2>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Track logs, request alerts, custody checkouts, and system audit logs.
          </p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Category Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        {["All", "Alerts", "Approvals", "Bookings"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`btn btn-sm ${activeFilter === filter ? "btn-primary" : "btn-secondary"}`}
            style={{ minWidth: "80px" }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Main List */}
      {filteredNotifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", border: "2px dashed var(--border-color)", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-primary)" }}>
          <div style={{ display: "inline-flex", padding: "12px", borderRadius: "50%", border: "2px solid var(--border-color)", backgroundColor: "var(--bg-tertiary)", marginBottom: "12px" }}>
            <Check size={24} />
          </div>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Inbox cleared!</h4>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No notifications matching the "{activeFilter}" filter found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredNotifs.map((notif) => {
            const isAlert = notif.type === "alert" || notif.type === "warning" || notif.message.toLowerCase().includes("overdue") || notif.message.toLowerCase().includes("discrepancy");
            const borderAccent = isAlert ? "var(--danger)" : "var(--accent-primary)";
            const bgAccent = isAlert ? "rgba(255, 173, 173, 0.12)" : "rgba(189, 178, 255, 0.08)";
            
            return (
              <div
                key={notif.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  backgroundColor: notif.is_read ? "var(--bg-secondary)" : bgAccent,
                  border: "2px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: notif.is_read ? "2px 2px 0px var(--border-color)" : "var(--shadow-sm)",
                  gap: "20px",
                  transition: "all 0.15s ease",
                  borderLeft: `6px solid ${borderAccent}`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: notif.is_read ? "var(--text-muted)" : borderAccent,
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <span
                      style={{
                        fontSize: "13.5px",
                        fontWeight: notif.is_read ? 500 : 700,
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-sans)",
                        wordBreak: "break-word",
                        lineHeight: "1.4"
                      }}
                    >
                      {notif.message}
                    </span>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                      ⏳ {getRelativeTime(notif.created_at)}
                    </div>
                  </div>
                </div>

                {!notif.is_read && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "4px 10px", fontSize: "11px" }}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
