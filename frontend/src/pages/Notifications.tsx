import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Bell, Check, MailOpen, AlertTriangle } from "lucide-react";

interface Notification {
  id: number;
  employee_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const Notifications: React.FC = () => {
  const { apiFetch } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"All" | "Alerts" | "Approvals" | "Bookings">("All");

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch("/notifications");
      setNotifications(data.notifications || []);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      showToast("success", "Notification marked as read");
    } catch (err: any) {
      showToast("error", err.message || "Failed to update notification");
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast("success", "All notifications marked as read");
    } catch (err: any) {
      showToast("error", err.message || "Failed to update notifications");
    }
  };

  const getRelativeTime = (isoString: string) => {
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Notifications</h2>
        <button onClick={handleMarkAllRead} className="text-sm text-blue-600 hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["All", "Alerts", "Approvals", "Bookings"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1 rounded text-xs font-semibold ${activeFilter === filter ? "bg-black text-white" : "bg-gray-200"}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredNotifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-secondary)" }}>
          <div style={{ display: "inline-flex", padding: "12px", borderRadius: "50%", border: "2px solid var(--border-color)", backgroundColor: "var(--bg-tertiary)", marginBottom: "12px" }}>
            <Check size={24} />
          </div>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>No notifications</h4>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>There are no alerts matching this filter category.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", border: "2px solid var(--border-color)", padding: "12px" }}>
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1.5px dashed var(--border-color)",
                padding: "12px 6px",
                gap: "16px"
              }}
            >
              {/* Dot & Message Details */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: notif.is_read ? "var(--text-muted)" : "#EF4444",
                    border: "1.5px solid var(--border-color)",
                    flexShrink: 0
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: notif.is_read ? 500 : 700,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                    wordBreak: "break-word"
                  }}
                >
                  {notif.message}
                </span>
              </div>

              {/* Time Indicator & Read Action */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <span style={{ fontSize: "11.5px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                  {getRelativeTime(notif.created_at)}
                </span>
                {!notif.is_read && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "2px 6px", fontSize: "10.5px" }}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
