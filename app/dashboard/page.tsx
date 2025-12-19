'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.fullName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Ethical Hacking Lab Platform - Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Total Labs
          </h3>
          <p className="text-3xl font-bold text-blue-600">8</p>
          <p className="text-sm text-gray-500 mt-2">Sessions available</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Completed
          </h3>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-sm text-gray-500 mt-2">Labs completed</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Progress
          </h3>
          <p className="text-3xl font-bold text-purple-600">0%</p>
          <p className="text-sm text-gray-500 mt-2">Overall completion</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Available Lab Sessions
        </h2>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Session 1: Introduction to Ethical Hacking & Reconnaissance
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Learn OSINT techniques and information gathering
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    BEGINNER
                  </span>
                  <span className="text-xs text-gray-500">
                    Duration: 2 weeks
                  </span>
                  <span className="text-xs text-gray-500">
                    Points: 100
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                Start Lab
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 opacity-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Session 2: Network Scanning with Nmap
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Master network scanning and service enumeration
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    INTERMEDIATE
                  </span>
                  <span className="text-xs text-gray-500">
                    Duration: 2 weeks
                  </span>
                  <span className="text-xs text-gray-500">
                    Points: 100
                  </span>
                </div>
              </div>
              <button disabled className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg text-sm cursor-not-allowed">
                Locked
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
