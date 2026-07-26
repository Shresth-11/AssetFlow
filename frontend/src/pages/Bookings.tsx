import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Calendar, Plus, Clock, HelpCircle, X, MapPin, Grid, CalendarDays, AlertTriangle, Sparkles } from "lucide-react";

interface Booking {
  id: number;
  asset_id: number;
  asset_name: string;
  asset_tag: string;
  booked_by_employee_id: number;
  booked_by_name: string;
  booked_by_email: string;
  booked_by_department_id: number | null;
  start_time: string;
  end_time: string;
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
}

interface Asset {
  id: number;
  name: string;
  asset_tag: string;
  is_bookable: boolean;
  status: string;
  location: string;
}

interface Category {
  id: number;
  name: string;
}

export const Bookings: React.FC = () => {
  const { apiFetch, user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookableAssets, setBookableAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout View Switch (All Bookings vs Resource Catalog vs Daily Scheduler)
  const [viewMode, setViewMode] = useState<"calendar" | "catalog" | "scheduler">("scheduler");

  // Booking Drawer Form
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetId, setAssetId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Scheduler View States
  const [schedulerDate, setSchedulerDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSchedulerAssetId, setSelectedSchedulerAssetId] = useState<number | "">("");

  // Add Resource Modal States
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [resName, setResName] = useState("");
  const [resCatId, setResCatId] = useState<number | "">("");
  const [resLocation, setResLocation] = useState("");
  const [resSerial, setResSerial] = useState("");
  const [resAcqDate, setResAcqDate] = useState(new Date().toISOString().split("T")[0]);
  const [resAcqCost, setResAcqCost] = useState<number | "">("");
  const [resCondition, setResCondition] = useState<any>("New");

  const fetchData = async () => {
    setLoading(true);
    try {
      const bookingsData = await apiFetch("/bookings");
      setBookings(bookingsData.bookings || []);

      const assetsData = await apiFetch("/assets");
      const bookable = (assetsData.assets || []).filter((a: any) => a.is_bookable);
      setBookableAssets(bookable);
      
      // Auto-select first bookable asset for scheduler
      if (bookable.length > 0 && !selectedSchedulerAssetId) {
        setSelectedSchedulerAssetId(bookable[0].id);
      }

      // Preload categories for Add Resource Modal
      const catsData = await apiFetch("/org/categories");
      setCategories(catsData.categories || []);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openBookingDrawer = (asset: Asset | null, initialStartTime?: string) => {
    setSelectedAsset(asset);
    setAssetId(asset ? asset.id : "");
    setStartDate(schedulerDate);
    setStartTime(initialStartTime || "");
    
    setEndDate(schedulerDate);
    if (initialStartTime) {
      const [h, m] = initialStartTime.split(":");
      const nextHour = String((Number(h) + 1) % 24).padStart(2, "0");
      setEndTime(`${nextHour}:${m}`);
    } else {
      setEndTime("");
    }
    
    setSubmitError(null);
    setShowDrawer(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const targetAssetId = selectedAsset ? selectedAsset.id : assetId;
    if (!targetAssetId || !startDate || !startTime || !endDate || !endTime) {
      showToast("error", "All fields are required");
      return;
    }

    try {
      const formattedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
      const formattedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;

      const startD = new Date(`${startDate}T${formattedStartTime}`);
      const endD = new Date(`${endDate}T${formattedEndTime}`);

      if (isNaN(startD.getTime()) || isNaN(endD.getTime())) {
        showToast("error", "Please provide valid start and end dates and times.");
        return;
      }

      await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          asset_id: Number(targetAssetId),
          start_time: startD.toISOString(),
          end_time: endD.toISOString(),
        }),
      });

      showToast("success", "Resource booked successfully!");
      setAssetId("");
      setSelectedAsset(null);
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setSubmitError(null);
      setShowDrawer(false);
      fetchData();
    } catch (err: any) {
      setSubmitError(err.message || "Overlap conflict detected or database lock error occurred.");
    }
  };

  const handleAddResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName || !resCatId || !resLocation) {
      showToast("error", "Name, Category, and Location are required");
      return;
    }

    try {
      const payload = {
        name: resName,
        category_id: Number(resCatId),
        serial_number: resSerial.trim() ? resSerial.trim() : null,
        acquisition_date: resAcqDate,
        acquisition_cost: resAcqCost ? Number(resAcqCost) : 0,
        condition: resCondition,
        location: resLocation,
        is_bookable: true,
      };

      await apiFetch("/assets", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showToast("success", "Bookable resource registered successfully!");
      setShowAddResourceModal(false);
      resetResourceForm();
      fetchData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const resetResourceForm = () => {
    setResName("");
    setResCatId("");
    setResLocation("");
    setResSerial("");
    setResAcqDate(new Date().toISOString().split("T")[0]);
    setResAcqCost("");
    setResCondition("New");
  };

  const handleCancelBooking = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    try {
      await apiFetch(`/bookings/${id}/cancel`, { method: "POST" });
      showToast("success", "Booking cancelled successfully");
      fetchData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", fontSize: "16px", color: "var(--text-secondary)" }}>Loading bookings scheduler...</div>;
  }

  // Visual Agenda helpers
  const getNext7Days = () => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  };
  const weekDays = getNext7Days();

  const getBookingsForDay = (date: Date) => {
    return bookings.filter((b) => {
      const bDate = new Date(b.start_time).toDateString();
      return bDate === date.toDateString();
    });
  };

  // Scheduler Helpers
  const selectedSchedulerAsset = bookableAssets.find((a) => a.id === Number(selectedSchedulerAssetId));
  const activeSchedulerBookings = bookings.filter((b) => {
    if (b.asset_id !== Number(selectedSchedulerAssetId)) return false;
    if (b.status === "Cancelled") return false;
    return new Date(b.start_time).toDateString() === new Date(schedulerDate).toDateString();
  });

  const schedulerHours = [
    { label: "9:00 AM", value: "09:00" },
    { label: "10:00 AM", value: "10:00" },
    { label: "11:00 AM", value: "11:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "1:00 PM", value: "13:00" },
    { label: "2:00 PM", value: "14:00" },
    { label: "3:00 PM", value: "15:00" },
    { label: "4:00 PM", value: "16:00" },
    { label: "5:00 PM", value: "17:00" },
    { label: "6:00 PM", value: "18:00" },
  ];

  const canAddResource = user?.role === "Admin" || user?.role === "AssetManager";

  return (
    <div className="animate-fade">
      {/* 1. Header Toolbar with View Mode Toggles */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px", backgroundColor: "var(--bg-secondary)", padding: "4px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
          <button
            className={`btn btn-sm ${viewMode === "scheduler" ? "btn-primary" : "btn-secondary"}`}
            style={{ border: viewMode === "scheduler" ? undefined : "none" }}
            onClick={() => setViewMode("scheduler")}
          >
            <Clock size={14} /> Interactive Time-Grid
          </button>
          <button
            className={`btn btn-sm ${viewMode === "catalog" ? "btn-primary" : "btn-secondary"}`}
            style={{ border: viewMode === "catalog" ? undefined : "none" }}
            onClick={() => setViewMode("catalog")}
          >
            <Grid size={14} /> Resource Catalog
          </button>
          <button
            className={`btn btn-sm ${viewMode === "calendar" ? "btn-primary" : "btn-secondary"}`}
            style={{ border: viewMode === "calendar" ? undefined : "none" }}
            onClick={() => setViewMode("calendar")}
          >
            <CalendarDays size={14} /> All Reservations ({bookings.length})
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {canAddResource && (
            <button className="btn btn-secondary" onClick={() => setShowAddResourceModal(true)}>
              <Plus size={16} /> Add Resource
            </button>
          )}
          <button className="btn btn-primary" onClick={() => openBookingDrawer(null)}>
            <Plus size={16} /> Reserve Resource
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE TIME-GRID SCHEDULER */}
      {viewMode === "scheduler" && (
        <div className="animate-fade">
          {/* Resource & Date selector header card */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: "260px" }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Select Bookable Shared Resource</label>
                <select
                  className="form-control"
                  style={{ fontSize: "14px", fontWeight: 600 }}
                  value={selectedSchedulerAssetId}
                  onChange={(e) => setSelectedSchedulerAssetId(e.target.value ? Number(e.target.value) : "")}
                >
                  {bookableAssets.length === 0 ? (
                    <option value="">No bookable resources registered</option>
                  ) : (
                    bookableAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.asset_tag}) — {a.location}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ width: "200px" }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Scheduler Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={schedulerDate}
                  onChange={(e) => setSchedulerDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Timeline Grid */}
          {!selectedSchedulerAsset ? (
            <div className="card" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
              Please select a bookable resource above to view its availability matrix.
            </div>
          ) : (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
                    {selectedSchedulerAsset.name} <span style={{ fontSize: "13px", color: "var(--accent-primary)" }}>({selectedSchedulerAsset.asset_tag})</span>
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Location: {selectedSchedulerAsset.location}</span>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}></span> Available Slot
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#FEF2F2", border: "1px solid #EF4444" }}></span> Booked Slot
                  </span>
                </div>
              </div>

              {/* Time Slots Matrix */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "12px" }}>
                {schedulerHours.map((slot) => {
                  const slotStart = new Date(`${schedulerDate}T${slot.value}:00`).getTime();
                  const slotEnd = slotStart + 3600000;

                  const overlappingBooking = activeSchedulerBookings.find((b) => {
                    const bStart = new Date(b.start_time).getTime();
                    const bEnd = new Date(b.end_time).getTime();
                    return slotStart < bEnd && slotEnd > bStart;
                  });

                  if (overlappingBooking) {
                    return (
                      <div
                        key={slot.value}
                        style={{
                          backgroundColor: "#FEF2F2",
                          border: "2px solid #EF4444",
                          borderRadius: "var(--radius-sm)",
                          padding: "14px",
                          color: "#991B1B",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> {slot.label}
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 600, marginTop: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          Reserved by {overlappingBooking.booked_by_name}
                        </div>
                        {user?.role === "Admin" || user?.id === overlappingBooking.booked_by_employee_id ? (
                          <button
                            style={{
                              marginTop: "8px",
                              background: "none",
                              border: "none",
                              color: "#DC2626",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: 0,
                              textDecoration: "underline"
                            }}
                            onClick={() => handleCancelBooking(overlappingBooking.id)}
                          >
                            Cancel Reservation
                          </button>
                        ) : null}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={slot.value}
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        border: "1px dashed var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        padding: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => openBookingDrawer(selectedSchedulerAsset, slot.value)}
                    >
                      <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} color="var(--accent-primary)" /> {slot.label}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 600, marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Plus size={10} /> Click to Book
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: RESOURCE CATALOG */}
      {viewMode === "catalog" && (
        <div className="grid-cols-3 animate-fade">
          {bookableAssets.length === 0 ? (
            <div className="card" style={{ gridColumn: "span 3", padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
              No bookable shared resources found in inventory catalog.
            </div>
          ) : (
            bookableAssets.map((asset) => (
              <div key={asset.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span className="badge badge-info">{asset.asset_tag}</span>
                    <span className="badge badge-success">{asset.status}</span>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>{asset.name}</h3>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "16px" }}>
                    <MapPin size={12} /> {asset.location}
                  </div>
                </div>

                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => openBookingDrawer(asset)}>
                  <Plus size={14} /> Reserve Slot
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW MODE 3: ALL RESERVATIONS DIRECTORY */}
      {viewMode === "calendar" && (
        <div className="card animate-fade">
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Organization Resource Reservations</h3>
          <div className="table-container">
            <table className="table-el">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Reserved By</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                      No resource bookings recorded.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td style={{ fontWeight: 600 }}>
                        {booking.asset_name} ({booking.asset_tag})
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{booking.booked_by_name}</div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{booking.booked_by_email}</span>
                      </td>
                      <td>{new Date(booking.start_time).toLocaleString()}</td>
                      <td>{new Date(booking.end_time).toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            booking.status === "Upcoming"
                              ? "badge-info"
                              : booking.status === "Ongoing"
                              ? "badge-success"
                              : booking.status === "Completed"
                              ? "badge-muted"
                              : "badge-danger"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {booking.status !== "Cancelled" && (user?.role === "Admin" || user?.id === booking.booked_by_employee_id) ? (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancelBooking(booking.id)}>
                            Cancel
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. BOOKING DRAWER / MODAL */}
      {showDrawer && (
        <div className="modal-overlay" onClick={() => setShowDrawer(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
                {selectedAsset ? `Reserve ${selectedAsset.name}` : "Reserve Shared Resource"}
              </h3>
              <button
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "20px" }}
                onClick={() => setShowDrawer(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleBookingSubmit}>
              <div className="modal-body">
                {submitError && (
                  <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #EF4444", color: "#991B1B", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "13px" }}>
                    {submitError}
                  </div>
                )}

                {!selectedAsset && (
                  <div className="form-group">
                    <label className="form-label">Resource</label>
                    <select
                      className="form-control"
                      value={assetId}
                      onChange={(e) => setAssetId(e.target.value ? Number(e.target.value) : "")}
                      required
                    >
                      <option value="">Select Resource...</option>
                      {bookableAssets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.asset_tag}) — {a.location}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input type="time" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input type="time" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDrawer(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD RESOURCE MODAL (Admin/Manager only) */}
      {showAddResourceModal && (
        <div className="modal-overlay" onClick={() => setShowAddResourceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
                <Sparkles size={16} color="var(--accent-primary)" style={{ display: "inline-block", marginRight: "6px", verticalAlign: "middle" }} />
                Add Bookable Resource
              </h3>
              <button
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "20px" }}
                onClick={() => setShowAddResourceModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddResourceSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Resource Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Conference Room B2, Projector AF-0062"
                    value={resName}
                    onChange={(e) => setResName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Resource Category</label>
                    <select
                      className="form-control"
                      value={resCatId}
                      onChange={(e) => setResCatId(e.target.value ? Number(e.target.value) : "")}
                      required
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location / Room</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Headquarters Floor 2"
                      value={resLocation}
                      onChange={(e) => setResLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Serial Number (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. SN-B2-CONF"
                      value={resSerial}
                      onChange={(e) => setResSerial(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condition</label>
                    <select className="form-control" value={resCondition} onChange={(e) => setResCondition(e.target.value as any)}>
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                      <option value="Damaged">Damaged</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Acquisition Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={resAcqDate}
                      onChange={(e) => setResAcqDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Acquisition Cost (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="0.00"
                      value={resAcqCost}
                      onChange={(e) => setResAcqCost(e.target.value ? Number(e.target.value) : "")}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddResourceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
