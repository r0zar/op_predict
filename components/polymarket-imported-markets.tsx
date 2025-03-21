'use client';

import React, { useEffect, useState } from 'react';
import { Market } from 'wisdom-sdk';
import Link from 'next/link';
import { Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Interface for the component props
interface PolymarketImportedMarketsProps {
  userId: string;
  isAdmin: boolean;
}

export default function PolymarketImportedMarkets({ userId, isAdmin }: PolymarketImportedMarketsProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerSync, setTriggerSync] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Function to fetch imported markets
  const fetchImportedMarkets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/markets?source=polymarket&limit=10');

      if (!response.ok) {
        throw new Error(`Failed to fetch imported markets: ${response.statusText}`);
      }

      const data = await response.json();
      setMarkets(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load imported markets');
      console.error('Error fetching imported markets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to manually trigger a sync (admin only)
  const triggerSyncNow = async () => {
    if (!isAdmin) return;

    try {
      setSyncStatus({ loading: true });

      // Get the CRON_SECRET from a secure admin endpoint
      const secretResponse = await fetch('/api/admin/get-cron-secret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!secretResponse.ok) {
        throw new Error('Failed to authenticate for sync');
      }

      const { secret } = await secretResponse.json();

      // Call the sync endpoint with the secret
      const syncResponse = await fetch('/api/cron/sync-polymarket', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secret}`
        }
      });

      if (!syncResponse.ok) {
        throw new Error(`Sync failed: ${syncResponse.statusText}`);
      }

      const syncResult = await syncResponse.json();
      setSyncStatus({
        loading: false,
        success: syncResult.success,
        result: syncResult
      });

      // Refresh the market list
      fetchImportedMarkets();
    } catch (err) {
      setSyncStatus({
        loading: false,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      console.error('Error triggering sync:', err);
    }
  };

  // Function to reset a stuck sync
  const resetSyncState = async (force: boolean = false) => {
    if (!isAdmin) return;

    try {
      setResetLoading(true);

      // Call the reset endpoint with userId for authentication
      const resetResponse = await fetch('/api/cron/reset-polymarket-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          force
        })
      });

      if (!resetResponse.ok) {
        throw new Error(`Reset failed: ${resetResponse.statusText}`);
      }

      const resetResult = await resetResponse.json();

      // Update the sync status
      setSyncStatus({
        loading: false,
        success: true,
        result: {
          success: true,
          syncStatus: {
            inProgress: false,
            lastRun: new Date().toISOString(),
            message: resetResult.message || 'Sync state reset successfully'
          }
        }
      });

      // Show a success message
      setResetLoading(false);
    } catch (err) {
      setSyncStatus({
        loading: false,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      setResetLoading(false);
      console.error('Error resetting sync:', err);
    }
  };

  // Load markets on component mount
  useEffect(() => {
    fetchImportedMarkets();
  }, []);

  // Render loading state
  if (loading && markets.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Polymarket Imported Markets</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && markets.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Polymarket Imported Markets</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Polymarket Imported Markets</h2>

        {isAdmin && (
          <div className="flex items-center space-x-2">
            {syncStatus?.result?.syncStatus?.inProgress && (
              <>
                <button
                  onClick={() => resetSyncState(false)}
                  disabled={resetLoading}
                  className="flex items-center space-x-1 px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50"
                >
                  <span>Reset Sync</span>
                </button>
                <button
                  onClick={() => resetSyncState(true)}
                  disabled={resetLoading}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  <span>Force Reset</span>
                </button>
              </>
            )}
            <button
              onClick={triggerSyncNow}
              disabled={syncStatus?.loading}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${syncStatus?.loading ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Sync status message */}
      {syncStatus && !syncStatus.loading && (
        <div className={`mb-4 p-3 rounded-md ${syncStatus.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          {syncStatus.success ? (
            <div>
              <p className="font-semibold">Sync {syncStatus.result.hasMorePages ? 'in progress' : 'completed successfully'}</p>
              <p>Created: {syncStatus.result.created}, Skipped: {syncStatus.result.skipped}, Errors: {syncStatus.result.errors}</p>
              {syncStatus.result.syncStatus && (
                <div className="mt-2 text-xs border-t pt-2">
                  <p className="font-semibold">Overall Sync Progress:</p>
                  <ul className="list-disc pl-4 mt-1">
                    <li>Current page: {syncStatus.result.syncStatus.currentPage}</li>
                    <li>Markets processed: {syncStatus.result.syncStatus.marketsProcessed}</li>
                    <li>Total created: {syncStatus.result.syncStatus.marketsCreated}</li>
                    <li>Last run: {new Date(syncStatus.result.syncStatus.lastRun).toLocaleString()}</li>
                    <li>In progress: {syncStatus.result.syncStatus.inProgress ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="font-semibold">{syncStatus.error || 'Sync failed'}</p>
              {syncStatus.result?.syncStatus && (
                <div className="mt-2 text-xs border-t pt-2">
                  <p className="font-semibold">Sync Status:</p>
                  <ul className="list-disc pl-4 mt-1">
                    <li>Current page: {syncStatus.result.syncStatus.currentPage}</li>
                    <li>Markets processed: {syncStatus.result.syncStatus.marketsProcessed}</li>
                    <li>Last run: {new Date(syncStatus.result.syncStatus.lastRun).toLocaleString()}</li>
                    <li>In progress: {syncStatus.result.syncStatus.inProgress ? 'Yes' : 'No'}</li>
                    {syncStatus.result.syncStatus.lastError && (
                      <li>Last error: {syncStatus.result.syncStatus.lastError}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Markets list */}
      {markets.length > 0 ? (
        <div className="space-y-4">
          {markets.map((market: any) => (
            <div key={market.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between">
                <Link href={`/markets/${market.id}`} className="text-blue-500 hover:text-blue-700 font-medium">
                  {market.name}
                </Link>

                {market.externalUrl && (
                  <a
                    href={market.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                  >
                    <span className="text-xs">Polymarket</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {market.description}
              </div>

              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Ends: {formatDistanceToNow(new Date(market.endDate), { addSuffix: true })}</span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {market.outcomes.map((outcome) => (
                  <div
                    key={outcome.id}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
                  >
                    {outcome.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No imported markets found</p>
        </div>
      )}
    </div>
  );
}