import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { api } from "../../services/api";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  CircleStop, 
  Settings, 
  Mail, 
  Users, 
  TrendingUp,
  Clock
} from "lucide-react";

export function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [campaignStats, setCampaignStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const [campaignResponse, statsResponse] = await Promise.all([
          api.get(`/campaigns/${id}`),
          api.get(`/campaigns/${id}/stats`)
        ]);
        setCampaign(campaignResponse.data);
        setCampaignStats(statsResponse.data);
      } catch (err) {
        setError("Failed to fetch campaign details");
        console.error("Error fetching campaign:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
    const statusColors = {
      'active': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800',
      'draft': 'bg-gray-100 text-gray-800',
      'stopped': 'bg-red-100 text-red-800'
    };
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    return <span className={`${baseClasses} ${colorClass}`}>{status}</span>;
  };

  const handleCampaignAction = async (action) => {
    try {
      setActionLoading(true);
      await api.patch(`/campaigns/${id}/${action}`);
      
      // Refresh campaign data
      const response = await api.get(`/campaigns/${id}`);
      setCampaign(response.data);
    } catch (err) {
      console.error(`Error ${action} campaign:`, err);
    } finally {
      setActionLoading(false);
    }
  };

  const getEngagementRate = () => {
    if (!campaignStats || !campaignStats.totalSent) return 0;
    return Math.round((campaignStats.totalReplies / campaignStats.totalSent) * 100);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
        <div className="text-center text-white">Loading campaign details...</div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
        <div className="text-red-400">Error: {error || "Campaign not found"}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/campaigns")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
            <p className="text-gray-400">Campaign details and performance metrics</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(campaign.status)}
        </div>
      </div>

      {/* Campaign Actions */}
      <Card className="p-6 bg-gray-800 border-gray-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Campaign Actions</h3>
            <p className="text-gray-400">Control campaign execution</p>
          </div>
          <div className="flex space-x-2">
            {campaign.status === 'active' && (
              <Button 
                variant="outline" 
                onClick={() => handleCampaignAction('pause')}
                disabled={actionLoading}
                className="flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}
            {campaign.status === 'paused' && (
              <Button 
                variant="default" 
                onClick={() => handleCampaignAction('resume')}
                disabled={actionLoading}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Resume
              </Button>
            )}
            {['active', 'paused'].includes(campaign.status) && (
              <Button 
                variant="destructive" 
                onClick={() => handleCampaignAction('stop')}
                disabled={actionLoading}
                className="flex items-center gap-2"
              >
                <CircleStop className="w-4 h-4" />
                Stop
              </Button>
            )}
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics Overview */}
      {campaignStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gray-800 border-gray-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Total Sent</div>
                <div className="text-2xl font-bold">{campaignStats.totalSent || 0}</div>
              </div>
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          <Card className="p-4 bg-gray-800 border-gray-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Replies</div>
                <div className="text-2xl font-bold text-green-400">{campaignStats.totalReplies || 0}</div>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          <Card className="p-4 bg-gray-800 border-gray-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Engagement Rate</div>
                <div className="text-2xl font-bold">{getEngagementRate()}%</div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
          <Card className="p-4 bg-gray-800 border-gray-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Remaining</div>
                <div className="text-2xl font-bold">{campaign.messagesToSend || 0}</div>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Information */}
        <Card className="p-6 bg-gray-800 border-gray-700 text-white">
          <h3 className="text-lg font-semibold mb-4">Campaign Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Campaign Name</span>
              <span className="text-white font-medium">{campaign.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Sender Email</span>
              <span className="text-white">{campaign.sender}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Language</span>
              <span className="text-white">{campaign.language || 'English'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Duration</span>
              <span className="text-white">{campaign.duration || 0} days</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Created By</span>
              <span className="text-white">{campaign.userId?.username || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Created Date</span>
              <span className="text-white">
                {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6 bg-gray-800 border-gray-700 text-white">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          {campaignStats ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Open Rate</span>
                <span className="text-white font-medium">
                  {campaignStats.openRate ? `${campaignStats.openRate}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Click Rate</span>
                <span className="text-white font-medium">
                  {campaignStats.clickRate ? `${campaignStats.clickRate}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Bounce Rate</span>
                <span className="text-white font-medium">
                  {campaignStats.bounceRate ? `${campaignStats.bounceRate}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Unsubscribe Rate</span>
                <span className="text-white font-medium">
                  {campaignStats.unsubscribeRate ? `${campaignStats.unsubscribeRate}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Avg. Response Time</span>
                <span className="text-white font-medium">
                  {campaignStats.avgResponseTime ? `${campaignStats.avgResponseTime}h` : 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No performance data available
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      {campaignStats && campaignStats.recentActivity && campaignStats.recentActivity.length > 0 && (
        <Card className="p-6 bg-gray-800 border-gray-700 text-white">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {campaignStats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-white">{activity.description}</span>
                </div>
                <span className="text-gray-400 text-sm">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

