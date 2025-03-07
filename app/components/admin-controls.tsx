'use client'

import { useState } from 'react'
import { createSampleMarkets } from '@/app/actions/seed-data';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminControlsProps {
  className?: string;
}

export default function AdminControls({ className }: AdminControlsProps) {
  const [isCreatingSamples, setIsCreatingSamples] = useState(false);
  const [createResult, setCreateResult] = useState<{ success: boolean; count: number } | null>(null);

  // Handle creating sample markets
  const handleCreateSamples = async () => {
    try {
      setIsCreatingSamples(true);
      setCreateResult(null);

      const result = await createSampleMarkets();
      setCreateResult(result);

      // Auto-refresh the page after creating samples
      if (result.success && result.count > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating sample markets:", error);
      setCreateResult({ success: false, count: 0 });
    } finally {
      setIsCreatingSamples(false);
    }
  };

  return (
    <Card className={cn("border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20", className)}>
      <CardHeader className="pb-3">
        <CardTitle>Admin Controls</CardTitle>
        <CardDescription>
          You have admin privileges on this platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Sample Data</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={handleCreateSamples}
                disabled={isCreatingSamples}
              >
                {isCreatingSamples ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Sample Markets'
                )}
              </Button>

              {createResult && (
                <span className={cn(
                  "text-sm inline-flex items-center",
                  createResult.success
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}>
                  {createResult.success ? (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      {createResult.count > 0
                        ? `Created ${createResult.count} markets`
                        : "Markets already exist"}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-1 h-4 w-4" />
                      Failed to create markets
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Market Management</h3>
            <div className="flex items-center space-x-2">
              <Button
                className="flex items-center"
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Refresh All Markets
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}