import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { DollarSign, BarChart3, TrendingUp, PieChart, Download } from "lucide-react";

export const Reports = () => {
  const { apiFetch } = useAuth();
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchValuationMetrics = async () => {
    try {
      const data = await apiFetch("/analytics/dashboard");
      setMetrics(data.kpis || null);
    } catch (err) {
      showToast("error", err.message || "Failed to load valuation metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValuationMetrics();
  }, []);

  const handleExportCSV = () => {
    showToast("info", "Generating valuation & lifecycle report CSV download...");
    const csvContent =
      "data:text/csv;charset=utf-8,Category,Total Assets,Valuation (USD),Depreciated Value (USD)\n" +
      "Laptops,12,28400,21300\n" +
      "Monitors,8,3200,2100\n" +
      "Desks,5,2500,2000\n" +
      "Conference Room Gear,3,9500,8100\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "AssetFlow_Valuation_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", fontSize: "16px", color: "var(--text-secondary)" }}>Loading reports & valuation...</div>;
  }

  const categoryValuations = [
    { category: "Laptops & Computing", count: 12, cost: 28400, netValue: 21300, color: "#5B5CEB" },
    { category: "Displays & Peripherals", count: 8, cost: 3200, netValue: 2100, color: "#00C2A8" },
    { category: "Office Furniture", count: 5, cost: 2500, netValue: 2000, color: "#FFB020" },
    { category: "AV & Conference Room", count: 3, cost: 9500, netValue: 8100, color: "#F43F5E" },
  ];

  const totalCost = categoryValuations.reduce((acc, curr) => acc + curr.cost, 0);
  const totalNet = categoryValuations.reduce((acc, curr) => acc + curr.netValue, 0);

  return (
    <div className="animate-fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Financial Valuation & Lifecycle Reports</h2>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Depreciation models, valuation summaries, and category asset distribution</span>
        </div>
        <button className="btn btn-primary" onClick={handleExportCSV}>
          <Download size={16} /> Export CSV Report
        </button>
      </div>

      <div className="grid-cols-3" style={{ marginBottom: "28px" }}>
        <div className="card" style={{ backgroundColor: "#ffffff", border: "2px solid var(--border-color)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Gross Acquisition Cost</span>
            <DollarSign size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
            ${totalCost.toLocaleString()}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>Cumulative purchase expenditure</span>
        </div>

        <div className="card" style={{ backgroundColor: "#ffffff", border: "2px solid var(--border-color)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Current Net Book Value</span>
            <TrendingUp size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
            ${totalNet.toLocaleString()}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>Straight-line 5-year depreciation</span>
        </div>

        <div className="card" style={{ backgroundColor: "#ffffff", border: "2px solid var(--border-color)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Total Tracked Assets</span>
            <BarChart3 size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
            {(metrics?.assetsAvailable || 0) + (metrics?.assetsAllocated || 0) + (metrics?.assetsUnderMaintenance || 0)} Units
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>Across all department categories</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "28px", backgroundColor: "#ffffff", border: "2px solid var(--border-color)", padding: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>Category Valuation Breakdown</h3>
        <div className="table-container">
          <table className="table-el">
            <thead>
              <tr>
                <th>Category</th>
                <th>Asset Count</th>
                <th>Acquisition Value</th>
                <th>Current Depreciated Value</th>
                <th>Value Share</th>
              </tr>
            </thead>
            <tbody>
              {categoryValuations.map((cat, idx) => {
                const percent = Math.round((cat.netValue / totalNet) * 100);
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: cat.color, marginRight: "8px" }}></span>
                      {cat.category}
                    </td>
                    <td>{cat.count} items</td>
                    <td>${cat.cost.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>${cat.netValue.toLocaleString()}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", backgroundColor: "var(--bg-tertiary)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${percent}%`, height: "100%", backgroundColor: cat.color }}></div>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 600 }}>{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-cols-2">
        <div className="card" style={{ backgroundColor: "#ffffff", border: "2px solid var(--border-color)", padding: "20px" }}>
          <h4 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Asset Status Distribution
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Available / Ready", val: metrics?.assetsAvailable || 0, color: "var(--success)" },
              { label: "Allocated / In Use", val: metrics?.assetsAllocated || 0, color: "var(--info)" },
              { label: "Under Maintenance", val: metrics?.assetsUnderMaintenance || 0, color: "var(--danger)" },
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600 }}>{stat.label}</span>
                  <span style={{ fontWeight: 700 }}>{stat.val}</span>
                </div>
                <div style={{ height: "8px", backgroundColor: "var(--bg-tertiary)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(stat.val * 10, 100)}%`, height: "100%", backgroundColor: stat.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ backgroundColor: "#ffffff", border: "2px solid var(--border-color)", padding: "20px" }}>
          <h4 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Maintenance Frequency
          </h4>
          
          <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "2px solid var(--border-color)", marginBottom: "12px", position: "relative" }}>
            <svg viewBox="0 0 400 150" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <path
                d="M 20,130 L 80,90 L 140,110 L 200,60 L 260,95 L 320,40 L 380,20"
                fill="none"
                stroke="#EF4444"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="20" cy="130" r="5" fill="#EF4444" stroke="#1a1a1a" strokeWidth="1.5" />
              <circle cx="80" cy="90" r="5" fill="#EF4444" stroke="#1a1a1a" strokeWidth="1.5" />
              <circle cx="140" cy="110" r="5" fill="#EF4444" stroke="#1a1a1a" strokeWidth="1.5" />
              <circle cx="200" cy="60" r="5" fill="#EF4444" stroke="#1a1a1a" strokeWidth="1.5" />
              <circle cx="260" cy="95" r="5" fill="#EF4444" stroke="#1a1a1a" strokeWidth="1.5" />
              <circle cx="320" cy="40" r="5" fill="#EF4444" stroke="#1a1a1a" strokeWidth="1.5" />
              <circle cx="380" cy="20" r="5" fill="#EF4444" stroke="#1a1a1a" strokeWidth="1.5" />
            </svg>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>
            <span>JAN</span>
            <span>FEB</span>
            <span>MAR</span>
            <span>APR</span>
            <span>MAY</span>
            <span>JUN</span>
            <span>JUL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
