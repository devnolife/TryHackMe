'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ProgressData {
  totalLabs: number;
  completedLabs: number;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  weeklyLabsScore: number;
  utsScore: number;
  uasScore: number;
  attendanceScore: number;
  finalGrade: number;
  letterGrade: string;
  labProgress: Array<{
    labId: string;
    sessionNumber: number;
    title: string;
    points: number;
    maxPoints: number;
    percentage: number;
    status: string;
  }>;
  activityHistory: Array<{
    date: string;
    points: number;
    commands: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`/api/progress/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading progress...</div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No progress data available</p>
      </div>
    );
  }

  // Prepare grade breakdown data
  const gradeData = [
    { name: 'Attendance (10%)', value: progress.attendanceScore * 0.1, full: 10 },
    { name: 'Weekly Labs (30%)', value: progress.weeklyLabsScore * 0.3, full: 30 },
    { name: 'UTS (25%)', value: progress.utsScore * 0.25, full: 25 },
    { name: 'UAS (35%)', value: progress.uasScore * 0.35, full: 35 },
  ];

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'text-green-600';
    if (grade === 'B+' || grade === 'B') return 'text-blue-600';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-600';
    if (grade === 'D') return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
        <p className="text-gray-600 mt-2">
          Track your learning journey and performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Overall Progress</h3>
          <p className="text-3xl font-bold text-blue-600">{progress.percentage}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {progress.totalPoints} / {progress.maxPoints} points
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Labs Completed</h3>
          <p className="text-3xl font-bold text-green-600">
            {progress.completedLabs} / {progress.totalLabs}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {Math.round((progress.completedLabs / progress.totalLabs) * 100)}% completion
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Current Grade</h3>
          <p className={`text-3xl font-bold ${getGradeColor(progress.letterGrade)}`}>
            {progress.letterGrade}
          </p>
          <p className="text-sm text-gray-500 mt-1">{progress.finalGrade.toFixed(2)} / 100</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Attendance</h3>
          <p className="text-3xl font-bold text-purple-600">{progress.attendanceScore}%</p>
          <p className="text-sm text-gray-500 mt-1">Present</p>
        </div>
      </div>

      {/* Grade Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Grade Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0ea5e9" name="Current" />
              <Bar dataKey="full" fill="#e5e7eb" name="Maximum" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Attendance (10%):</span>
              <span className="font-semibold">{progress.attendanceScore}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Weekly Labs (30%):</span>
              <span className="font-semibold">{progress.weeklyLabsScore.toFixed(2)}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>UTS (25%):</span>
              <span className="font-semibold">{progress.utsScore}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>UAS (35%):</span>
              <span className="font-semibold">{progress.uasScore}/100</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Final Grade:</span>
              <span className={getGradeColor(progress.letterGrade)}>
                {progress.finalGrade.toFixed(2)} ({progress.letterGrade})
              </span>
            </div>
          </div>
        </div>

        {/* Lab Progress Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lab Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progress.labProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sessionNumber" label={{ value: 'Session', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Points', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="points" fill="#10b981" name="Earned" />
              <Bar dataKey="maxPoints" fill="#e5e7eb" name="Maximum" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Timeline */}
      {progress.activityHistory && progress.activityHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Timeline</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progress.activityHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="points" stroke="#0ea5e9" name="Points Earned" />
              <Line yAxisId="right" type="monotone" dataKey="commands" stroke="#10b981" name="Commands Executed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Lab Details Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Lab Sessions Detail</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {progress.labProgress.map((lab) => (
                <tr key={lab.labId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{lab.sessionNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{lab.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>{lab.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${lab.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lab.points} / {lab.maxPoints}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lab.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : lab.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {lab.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
