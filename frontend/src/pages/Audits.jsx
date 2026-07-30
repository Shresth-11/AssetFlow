import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Plus, ShieldAlert, FileText } from "lucide-react";

export const Audits = () => {
  const { apiFetch, user } = useAuth();
  const { showToast } = useToast();
  const [cycles, setCycles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cycle Creation Form State
  const [scopeDeptId, setScopeDeptId] = useState("");
  const [scopeLocation, setScopeLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAuditors, setSelectedAuditors] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Active Selected Cycle for Auditing or Reports
  const [activeCycle, setActiveCycle] = useState(null);
  const [scopedAssets, setScopedAssets] = useState([]);
  const [submittedResults, setSubmittedResults] = useState({});
  const [discrepancyReport, setDiscrepancyReport] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Form input for auditing an asset
  const [auditingAsset, setAuditingAsset] = useState(null);
  const [auditOutcome, setAuditOutcome] = useState("Verified");
  const [auditNotes, setAuditNotes] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const cyclesData = await apiFetch("/audits/cycles");
      setCycles(cyclesData.cycles || []);

      const empsData = await apiFetch("/org/employees");
      setEmployees(empsData.employees || []);

      const deptsData = await apiFetch("/org/departments");
      setDepartments(deptsData.departments || []);
    } catch (err) {
      showToast("error", err.message || "Failed to load audit cycles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCycleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || selectedAuditors.length === 0) {
      showToast("error", "Start date, End date, and at least 1 Auditor are required.");
      return;
    }

    try {
      const payload = {
        scope_department_id: scopeDeptId === "" ? null : Number(scopeDeptId),
        scope_location: scopeLocation || null,
        start_date: startDate,
        end_date: endDate,
        auditor_ids: selectedAuditors,
      };

      await apiFetch("/audits/cycles", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showToast("success", "Audit Cycle scheduled successfully!");
      setShowCreateModal(false);
      setScopeDeptId("");
      setScopeLocation("");
      setStartDate("");
      setEndDate("");
      setSelectedAuditors([]);
      fetchData();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const toggleAuditorSelection = (empId) => {
    if (selectedAuditors.includes(empId)) {
      setSelectedAuditors(selectedAuditors.filter((id) => id !== empId));
    } else {
      setSelectedAuditors([...selectedAuditors, empId]);
    }
  };

  const handleSelectCycle = async (cycle) => {
    setActiveCycle(cycle);
    setAuditingAsset(null);
    try {
      const report = await apiFetch(`/audits/cycles/${cycle.id}/report`);
      setScopedAssets(report.scoped_assets || []);
      setDiscrepancyReport(report.discrepancy_report || null);

      const resMap = {};
      (report.results || []).forEach((r) => {
        resMap[r.asset_id] = r;
      });
      setSubmittedResults(resMap);
    } catch (err) {
      showToast("error", err.message || "Failed to fetch audit report details");
    }
  };

  const handleAuditOutcomeSubmit = async (e) => {
    e.preventDefault();
    if (!activeCycle || !auditingAsset) return;

    try {
      await apiFetch(`/audits/cycles/${activeCycle.id}/results`, {
        method: "POST",
        body: JSON.stringify({
          asset_id: auditingAsset.id,
          result: auditOutcome,
          notes: auditNotes || null,
        }),
      });

      showToast("success", `Outcome recorded for ${auditingAsset.asset_tag}`);
      setAuditingAsset(null);
      setAuditNotes("");
      setAuditOutcome("Verified");
      
      handleSelectCycle(activeCycle);
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleConfirmCloseCycle = async () => {
    if (!activeCycle) return;
    try {
      await apiFetch(`/audits/cycles/${activeCycle.id}/close`, { method: "POST" });
      showToast("success", "Audit Cycle closed successfully. Asset statuses updated.");
      setShowCloseModal(false);
      setActiveCycle(null);
      fetchData();
    } catch (err) {
      showToast("error", err.message);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", fontSize: "16px", color: "var(--text-secondary)" }}>Loading audits...</div>;
  }

  const isAdmin = user?.role === "Admin";

  return (
    <div className="animate-fade">
      {/* Header Panel */}
      <div className="card animate-fade" style={{ backgroundColor: "#FFFFFF", padding: "24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            🔍 Physical Inventory Audit Cycles
          </h2>
          <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "4px", display: "block" }}>
            Create audit schedules, assign verification staff, and reconcile physical inventory with real-time location checks.
          </span>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Schedule Audit Cycle
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {cycles.length === 0 ? (
          <div className="card" style={{ gridColumn: "span 3", padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No audit cycles created yet. Click "+ Schedule Audit Cycle" to launch a physical audit sweep.
          </div>
        ) : (
          cycles.map((cycle) => {
            const isSelected = activeCycle?.id === cycle.id;
            return (
              <div
                key={cycle.id}
                className="card"
                style={{
                  cursor: "pointer",
                  borderColor: isSelected ? "var(--accent-primary)" : "var(--border-color)",
                  backgroundColor: isSelected ? "rgba(189, 178, 255, 0.05)" : "var(--bg-secondary)",
                  transform: isSelected ? "translate(-2px, -2px)" : "none",
                  boxShadow: isSelected ? "var(--shadow-lg)" : "var(--shadow-md)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px"
                }}
                onClick={() => handleSelectCycle(cycle)}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                    <span className={`badge ${cycle.status === "Open" ? "badge-success" : "badge-muted"}`}>
                      {cycle.status === "Open" ? "🟢 Open" : "🔒 Closed"} Cycle #{cycle.id}
                    </span>
                    <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {formatDisplayDate(cycle.start_date)} - {formatDisplayDate(cycle.end_date)}
                    </span>
                  </div>

                  <h4 style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "4px" }}>
                    🏢 {cycle.department_name ? cycle.department_name : "All Departments"}
                  </h4>
                  {cycle.scope_location && (
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                      📍 {cycle.scope_location}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: "2px dashed var(--border-color)", paddingTop: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>📋 Auditors:</strong>{" "}
                  {cycle.auditors && cycle.auditors.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                      {cycle.auditors.map((a) => (
                        <span key={a.id} className="badge badge-muted" style={{ padding: "2px 6px", fontSize: "10.5px" }}>
                          👤 {a.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "Unassigned"
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeCycle && (
        <div className="card animate-fade" style={{ padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid var(--border-color)", paddingBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                🛠️ Audit Execution Workspace — Cycle #{activeCycle.id} ({activeCycle.status})
              </h3>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Scope: {activeCycle.department_name || "Organization-wide"} | {activeCycle.scope_location || "All Locations"}
              </div>
            </div>
            {isAdmin && activeCycle.status === "Open" && (
              <button className="btn btn-danger btn-sm" onClick={() => setShowCloseModal(true)}>
                Close Audit Cycle
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>
                Scoped Asset Checklist ({scopedAssets.length} Assets)
              </h4>
              <div className="table-container" style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table className="table-el">
                  <thead>
                    <tr>
                      <th>Tag</th>
                      <th>Asset Name</th>
                      <th>Location</th>
                      <th>Audit Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedAssets.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                          No assets matched the current audit scope parameters.
                        </td>
                      </tr>
                    ) : (
                      scopedAssets.map((asset) => {
                        const resultRecord = submittedResults[asset.id];
                        return (
                          <tr key={asset.id}>
                            <td style={{ fontWeight: 600 }}>{asset.asset_tag}</td>
                            <td>{asset.name}</td>
                            <td>{asset.location}</td>
                            <td>
                              {resultRecord ? (
                                <span
                                  className={`badge ${
                                    resultRecord.result === "Verified"
                                      ? "badge-success"
                                      : resultRecord.result === "Missing"
                                      ? "badge-danger"
                                      : "badge-warning"
                                  }`}
                                >
                                  {resultRecord.result}
                                </span>
                              ) : (
                                <span className="badge badge-muted">Pending Verification</span>
                              )}
                            </td>
                            <td>
                              {activeCycle.status === "Open" && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setAuditingAsset(asset);
                                    if (resultRecord) {
                                      setAuditOutcome(resultRecord.result);
                                      setAuditNotes(resultRecord.notes || "");
                                    }
                                  }}
                                >
                                  {resultRecord ? "Edit Log" : "Audit"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {discrepancyReport && (discrepancyReport.missing_count > 0 || discrepancyReport.damaged_count > 0) && (
                <div
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "2px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px 16px",
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    fontSize: "13px",
                    marginTop: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <ShieldAlert size={18} style={{ color: "#EF4444" }} />
                  <span>Discrepancy Report: {discrepancyReport.missing_count} Missing, {discrepancyReport.damaged_count} Damaged</span>
                </div>
              )}
            </div>

            <div>
              {auditingAsset ? (
                <div className="card" style={{ padding: "20px", border: "2px solid var(--border-color)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", borderBottom: "2px solid var(--border-color)", paddingBottom: "8px" }}>
                    ✍️ Log Outcome: {auditingAsset.asset_tag}
                  </h4>
                  <form onSubmit={handleAuditOutcomeSubmit}>
                    <div className="form-group">
                      <label className="form-label">Asset Name</label>
                      <input type="text" className="form-control" value={auditingAsset.name} disabled />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Audit Outcome</label>
                      <select
                        className="form-control"
                        value={auditOutcome}
                        onChange={(e) => setAuditOutcome(e.target.value)}
                      >
                        <option value="Verified">Verified (Present & OK)</option>
                        <option value="Missing">Missing (Not Found)</option>
                        <option value="Damaged">Damaged (Faulty)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Remarks / Notes</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Log observations..."
                        value={auditNotes}
                        onChange={(e) => setAuditNotes(e.target.value)}
                      ></textarea>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Save Log</button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAuditingAsset(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "2px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
                  <FileText size={32} style={{ marginBottom: "12px", color: "var(--text-secondary)", opacity: 0.7 }} />
                  <div style={{ fontSize: "13px", fontWeight: 500 }}>Select an asset from the checklist to log its physical audit status.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content animate-fade" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Schedule Physical Audit Cycle</h3>
              <button
                style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "20px" }}
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateCycleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Department Scope (Optional)</label>
                  <select
                    className="form-control"
                    value={scopeDeptId}
                    onChange={(e) => setScopeDeptId(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="">All Departments (Organization-wide)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location Scope (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Floor 2, Server Room, Headquarters"
                    value={scopeLocation}
                    onChange={(e) => setScopeLocation(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Auditor Staff</label>
                  <div style={{ maxHeight: "150px", overflowY: "auto", border: "2px solid var(--border-color)", padding: "8px", borderRadius: "var(--radius-sm)", backgroundColor: "#FFFFFF" }}>
                    {employees.map((emp) => (
                      <label key={emp.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", cursor: "pointer", fontSize: "13px", borderBottom: "1px solid var(--bg-primary)" }}>
                        <input
                          type="checkbox"
                          style={{ accentColor: "var(--accent-primary)", width: "16px", height: "16px", cursor: "pointer" }}
                          checked={selectedAuditors.includes(emp.id)}
                          onChange={() => toggleAuditorSelection(emp.id)}
                        />
                        <span style={{ fontWeight: 500 }}>{emp.name}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto" }}>{emp.role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Launch Audit Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCloseModal && activeCycle && (
        <div className="modal-overlay" onClick={() => setShowCloseModal(false)}>
          <div className="modal-content animate-fade" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--danger)", margin: 0 }}>
                ⚠️ Close Audit Cycle #{activeCycle.id}?
              </h3>
              <button
                style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "20px" }}
                onClick={() => setShowCloseModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: "13.5px", lineHeight: "1.5", color: "var(--text-secondary)" }}>
              Closing this cycle is final. It will lock all outcome logs and automatically update asset statuses immediately (e.g. Missing → Lost, Damaged → Under Maintenance).
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmCloseCycle}>
                Confirm Close Cycle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
