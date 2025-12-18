'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const TerminalEmulator = dynamic(() => import('@/components/terminal/TerminalEmulator'), {
  ssr: false,
  loading: () => <div className="h-[600px] flex items-center justify-center bg-gray-900 text-white">Loading terminal...</div>,
});

interface Lab {
  id: string;
  title: string;
  description: string;
  topic: string;
  sessionNumber: number;
  difficultyLevel: string;
  scenarios: Array<{
    id: string;
    scenarioTitle: string;
    scenarioDescription: string;
    targetInfo: any;
    successCriteria: any;
    hints: any;
    maxPoints: number;
  }>;
}

export default function LabPage() {
  const params = useParams();
  const router = useRouter();
  const labId = params.labId as string;

  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    if (labId) {
      fetchLabDetails();
    }
  }, [labId]);

  const fetchLabDetails = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/labs/${labId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLab(data.lab);
        if (data.lab.scenarios.length > 0) {
          setCurrentScenario(data.lab.scenarios[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching lab details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommandExecute = async (command: string): Promise<string> => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/commands/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          command,
          scenarioId: currentScenario?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return data.output;
      } else {
        return `Error: ${data.error || 'Command execution failed'}`;
      }
    } catch (error) {
      console.error('Error executing command:', error);
      return 'Error: Failed to execute command';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading lab...</div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lab not found</p>
        <button
          onClick={() => router.push('/labs')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Labs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/labs')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Labs
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Session {lab.sessionNumber}: {lab.title}
              </h1>
              <p className="text-gray-600">{lab.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Lab Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Scenario Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              📋 Current Scenario
            </h2>

            {currentScenario && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {currentScenario.scenarioTitle}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {currentScenario.scenarioDescription}
                </p>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Target Info:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {currentScenario.targetInfo.company && (
                      <div>Company: {currentScenario.targetInfo.company}</div>
                    )}
                    {currentScenario.targetInfo.domain && (
                      <div>Domain: {currentScenario.targetInfo.domain}</div>
                    )}
                    {currentScenario.targetInfo.ip_address && (
                      <div>IP: {currentScenario.targetInfo.ip_address}</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">Hints</h4>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {showHints ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {showHints && currentScenario.hints && (
                    <div className="space-y-2">
                      {currentScenario.hints.map((hint: any, index: number) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm">
                          <div className="font-medium text-yellow-800">
                            Hint {hint.level} (-{hint.point_penalty} points)
                          </div>
                          <div className="text-yellow-700">{hint.hint_text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Objectives */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              🎯 Objectives
            </h2>

            {currentScenario?.successCriteria && (
              <div className="space-y-2">
                {currentScenario.successCriteria.map((criteria: any, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-gray-400">□</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{criteria.description}</div>
                      <div className="text-xs text-gray-500">+{criteria.points} points</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Terminal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              💻 Lab Terminal
            </h2>

            <div className="h-[600px]">
              <TerminalEmulator
                onCommandExecute={handleCommandExecute}
                labTitle={lab.title}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
