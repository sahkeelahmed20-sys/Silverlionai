import { Users, Shield, Calendar, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

interface AdminPanelProps {
  users: User[];
  currentUser: User | null;
}

export function AdminPanel({ users, currentUser }: AdminPanelProps) {
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="bg-[#1a1a1a] border-white/10 max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">
              You do not have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
        <p className="text-gray-400">Manage users and platform settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#ffdf8d]" />
              <span className="text-sm text-gray-400">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-white">{users.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#ffdf8d]" />
              <span className="text-sm text-gray-400">Admins</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Subscribed</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {users.filter(u => u.isSubscribed).length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-[#ffdf8d]" />
              <span className="text-sm text-gray-400">New Today</span>
            </div>
            <p className="text-2xl font-bold text-white">1</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Subscription</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Tier</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffdf8d] to-amber-600 flex items-center justify-center text-black font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={
                        user.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {user.isSubscribed ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.subscriptionTier ? (
                        <Badge className={
                          user.subscriptionTier === 'enterprise'
                            ? 'bg-[#ffdf8d]/20 text-[#ffdf8d]'
                            : user.subscriptionTier === 'pro'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }>
                          {user.subscriptionTier}
                        </Badge>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Platform Settings */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Platform Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Maintenance Mode</p>
                <p className="text-sm text-gray-500">Temporarily disable platform access</p>
              </div>
              <Button variant="outline" className="border-white/20 text-gray-400">
                Disabled
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
              <div>
                <p className="text-white font-medium">New Registrations</p>
                <p className="text-sm text-gray-500">Allow new user signups</p>
              </div>
              <Button variant="outline" className="border-green-500/30 text-green-400">
                Enabled
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
              <div>
                <p className="text-white font-medium">AI Signal Generation</p>
                <p className="text-sm text-gray-500">Auto-generate trading signals</p>
              </div>
              <Button variant="outline" className="border-green-500/30 text-green-400">
                Active
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
              <div>
                <p className="text-white font-medium">WebSocket Connection</p>
                <p className="text-sm text-gray-500">Real-time market data feed</p>
              </div>
              <Button variant="outline" className="border-green-500/30 text-green-400">
                Connected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminPanel;
