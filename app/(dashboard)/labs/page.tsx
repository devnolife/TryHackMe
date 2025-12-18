'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Lab {
  id: string;
  title: string;
  description: string;
  topic: string;
  sessionNumber: number;
  difficultyLevel: string;
  estimatedDurationMinutes: number;
  progress: {
    totalPoints: number;
    maxPoints: number;
    percentage: number;
    status: string;
  };
  _count: {
    scenarios: number;
  };
}

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/labs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLabs(data.labs);
      }
    } catch (error) {
      console.error('Error fetching labs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'IN_PROGRESS':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading labs...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lab Sessions</h1>
        <p className="text-gray-600 mt-2">
          Select a lab session to begin your ethical hacking training
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {labs.map((lab, index) => (
          <div
            key={lab.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      #{lab.sessionNumber}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">
                      {lab.title}
                    </h2>
                  </div>

                  <p className="text-gray-600 mb-3">{lab.description}</p>

                  <div className="flex items-center gap-4 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full ${getDifficultyColor(lab.difficultyLevel)}`}>
                      {lab.difficultyLevel}
                    </span>
                    <span className="text-sm text-gray-500">
                      📚 {lab.topic}
                    </span>
                    <span className="text-sm text-gray-500">
                      ⏱️ {Math.floor(lab.estimatedDurationMinutes / 60)} hours
                    </span>
                    <span className="text-sm text-gray-500">
                      🎯 {lab._count.scenarios} scenario(s)
                    </span>
                    <span className="text-sm text-gray-500">
                      💯 {lab.progress.maxPoints} points
                    </span>
                  </div>
                </div>

                <div className="ml-4">
                  <Link
                    href={`/labs/${lab.id}`}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    {lab.progress.status === 'NOT_STARTED' ? 'Start Lab' : 'Continue'}
                  </Link>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className={`text-sm font-medium ${getStatusColor(lab.progress.status)}`}>
                    {lab.progress.totalPoints} / {lab.progress.maxPoints} points ({lab.progress.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${lab.progress.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {labs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No lab sessions available</p>
        </div>
      )}
    </div>
  );
}
