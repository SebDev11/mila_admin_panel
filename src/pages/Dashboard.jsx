import { Card } from "../components/ui/Card";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export function Dashboard() {
  const [stats, setStats] = useState({
    emailsSent: 0,
    activeCampaigns: 0,
    engagedLeads: 0,
    systemHealth: "Loading..."
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [breakdown, setBreakdown] = useState({ byCampaign: [], byUser: [] });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch main stats
        const statsResponse = await api.get("/stats");
        setStats({
          emailsSent: statsResponse.data.emailsSent || 0,
          activeCampaigns: statsResponse.data.activeCampaigns || 0,
          engagedLeads: statsResponse.data.engagedLeads || 0,
          systemHealth: statsResponse.data.systemHealth || "Healthy"
        });

        // Fetch weekly engagement data
        const weeklyResponse = await api.get("/stats/weekly-engagement");
        setChartData(weeklyResponse.data || []);

        // Fetch breakdown for tables
        const breakdownResponse = await api.get("/stats/weekly-engagement-breakdown");
        setBreakdown(breakdownResponse.data || { byCampaign: [], byUser: [] });
      } catch (err) {
        setError("Failed to fetch dashboard data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <div className="text-blue-200 text-lg font-medium">Loading Dashboard</div>
            <div className="text-blue-300/70 text-sm mt-2">Fetching analytics and statistics</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="text-red-400 text-lg font-semibold mb-2">Error Loading Dashboard</div>
            <div className="text-red-300/70 text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">Dashboard</h1>
            <p className="text-blue-200 text-sm sm:text-base lg:text-lg font-medium mb-3 sm:mb-4">Overview of your email marketing performance</p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-green-300 text-xs sm:text-sm font-semibold">System Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-blue-300 text-xs sm:text-sm font-semibold">Real-time Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-purple-300 text-xs sm:text-sm font-semibold">Live Analytics</span>
              </div>
            </div>
          </div>
          <div className="text-center lg:text-right">
            <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{stats.emailsSent.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-blue-200 font-semibold">Total Emails Sent</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/50 to-indigo-500/50 border-blue-500/70 shadow-xl backdrop-blur-xl 
          transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/40">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-400 rounded-full shadow-lg animate-pulse"></div>
            <div className="text-white text-xs sm:text-sm font-semibold">Total Emails Sent</div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">{stats.emailsSent.toLocaleString()}</div>
          <div className="text-white/90 text-xs font-medium">All time</div>
        </Card>
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-500/50 to-emerald-500/50 border-green-500/70 shadow-xl 
          backdrop-blur-xl transform hover:scale-105 transition-all duration-300 hover:shadow-green-500/40">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full shadow-lg animate-pulse"></div>
            <div className="text-white text-xs sm:text-sm font-semibold">Active Campaigns</div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">{stats.activeCampaigns}</div>
          <div className="text-white/90 text-xs font-medium">Currently running</div>
        </Card>
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-500/50 to-violet-500/50 border-purple-500/70 shadow-xl 
          backdrop-blur-xl transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/40">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-400 rounded-full shadow-lg animate-pulse"></div>
            <div className="text-white text-xs sm:text-sm font-semibold">Engaged Leads</div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">{stats.engagedLeads.toLocaleString()}</div>
          <div className="text-white/90 text-xs font-medium">Interacted with emails</div>
        </Card>
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-yellow-500/50 to-orange-500/50 border-yellow-500/70 shadow-xl 
          backdrop-blur-xl transform hover:scale-105 transition-all duration-300 hover:shadow-yellow-500/40">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full shadow-lg animate-pulse"></div>
            <div className="text-white text-xs sm:text-sm font-semibold">System Health</div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">{stats.systemHealth}</div>
          <div className="text-white/90 text-xs font-medium">Current status</div>
        </Card>
      </div>

      <Card className="p-4 sm:p-6 bg-slate-800/40 border-slate-600/30 shadow-xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 
                  0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 
                  2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">     
              </path>
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">Email Engagement This Week</h3>
            <p className="text-blue-200 text-xs">Weekly performance metrics and trends</p>
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis 
                dataKey="label" 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                wrapperClassName="text-black bg-white border border-gray-300 rounded-lg shadow-xl" 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#1e293b', fontWeight: '600' }}
              />
              <Bar 
                dataKey="sent" 
                fill="url(#sentGradient)" 
                name="Emails Sent" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="engaged" 
                fill="url(#engagedGradient)" 
                name="Engaged Leads" 
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="engagedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 
                    2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 
                    012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                </path>
              </svg>
            </div>
            <div className="text-slate-300 text-base sm:text-lg font-medium mb-2">No Engagement Data</div>
            <div className="text-slate-400 text-sm">No engagement data available for this week</div>
          </div>
        )}
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6 bg-slate-800/40 border-slate-600/30 shadow-xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 
                    0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                </path>
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">Sent Emails by Campaign</h3>
              <p className="text-blue-200 text-xs">Last 7 days performance</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-600/30">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-600/30">
                <thead className="bg-slate-700/40">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wide">Campaign</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wide">Sent Emails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600/30 bg-slate-800/20">
              {breakdown.byCampaign.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center text-slate-400 py-6 sm:py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 
                                0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 
                                1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4">
                            </path>
                          </svg>
                        </div>
                        <span className="text-sm">No campaign data available</span>
                      </div>
                    </td>
                  </tr>
              ) : (
                  breakdown.byCampaign.map((row, idx) => (
                    <tr key={row.name || idx} className="hover:bg-slate-700/30 transition-colors duration-200">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-white text-xs sm:text-sm font-medium">{row.name || 'Unknown'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {row.count.toLocaleString()}
                        </span>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
          </div>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-slate-800/40 border-slate-600/30 shadow-xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">Sent Emails by User</h3>
              <p className="text-blue-200 text-xs">Last 7 days performance</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-600/30">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-600/30">
                <thead className="bg-slate-700/40">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wide">User (Sender Email)</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wide">Sent Emails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600/30 bg-slate-800/20">
              {breakdown.byUser.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center text-slate-400 py-6 sm:py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                        <span className="text-sm">No user data available</span>
                      </div>
                    </td>
                  </tr>
              ) : (
                breakdown.byUser.map((row, idx) => (
                    <tr key={row.email || idx} className="hover:bg-slate-700/30 transition-colors duration-200">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-white text-xs sm:text-sm font-medium">{row.email || 'Unknown'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                          {row.count.toLocaleString()}
                        </span>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
