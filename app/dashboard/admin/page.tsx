'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Analytics {
  users: {
    total: number;
    students: number;
    instructors: number;
    admins: number;
    active: number;
    newLast30Days: number;
  };
  labs: {
    total: number;
    active: number;
    scenarios: number;
  };
  progress: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  commands: {
    total: number;
    valid: number;
    recentLast30Days: number;
    validityRate: number;
  };
  submissions: {
    total: number;
    completed: number;
    pending: number;
    recentLast30Days: number;
  };
  reports: {
    total: number;
  };
  activityTimeline: Array<{
    date: string;
    commands: number;
  }>;
  topStudents: Array<{
    id: string;
    fullName: string;
    studentId: string;
    totalPoints: number;
  }>;
  labCompletionRates: Array<{
    sessionNumber: number;
    title: string;
    completionRate: number;
    completedStudents: number;
    totalStudents: number;
  }>;
  avgPointsByLab: Array<{
    sessionNumber: number;
    title: string;
    avgPoints: number;
  }>;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
        setError('Unauthorized access');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Platform analytics and management overview
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/users"
          className="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700 transition"
        >
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <p className="text-sm text-blue-100">Manage students, instructors, and admins</p>
        </Link>

        <Link
          href="/admin/audit-logs"
          className="bg-purple-600 text-white rounded-lg p-6 hover:bg-purple-700 transition"
        >
          <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
          <p className="text-sm text-purple-100">View system activity and security logs</p>
        </Link>

        <Link
          href="/labs"
          className="bg-green-600 text-white rounded-lg p-6 hover:bg-green-700 transition"
        >
          <h3 className="text-lg font-semibold mb-2">Lab Sessions</h3>
          <p className="text-sm text-green-100">View and manage lab content</p>
        </Link>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.users.total}</p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics.users.students} students, {analytics.users.instructors} instructors
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Labs</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.labs.active}</p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics.labs.scenarios} scenarios total
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-purple-600">{analytics.progress.completionRate}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics.progress.completed} / {analytics.progress.total} completed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Commands</h3>
          <p className="text-3xl font-bold text-orange-600">{analytics.commands.total}</p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics.commands.validityRate}% valid
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Timeline (Last 14 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.activityTimeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="commands" stroke="#0ea5e9" name="Commands Executed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Lab Completion Rates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lab Completion Rates</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.labCompletionRates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sessionNumber" label={{ value: 'Session', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completionRate" fill="#10b981" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Points by Lab */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Average Points by Lab</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.avgPointsByLab}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sessionNumber" label={{ value: 'Session', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Avg Points', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgPoints" fill="#0ea5e9" name="Average Points" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Students Leaderboard */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Top 10 Students</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topStudents.map((student, index) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                    {student.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">New Users (30 days)</h3>
          <p className="text-2xl font-bold text-blue-600">{analytics.users.newLast30Days}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Commands (30 days)</h3>
          <p className="text-2xl font-bold text-green-600">{analytics.commands.recentLast30Days}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Submissions</h3>
          <p className="text-2xl font-bold text-orange-600">{analytics.submissions.pending}</p>
        </div>
      </div>
    </div>
  );
}
