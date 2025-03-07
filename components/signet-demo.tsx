'use client';

import React, { useState } from 'react';
import { useSignet } from '@/lib/signet-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SignetDemo() {
  const signet = useSignet();
  const [response, setResponse] = useState<any>(null);

  // Demo for system notification
  const handleSystemNotification = () => {
    signet.showNotification({
      title: 'SYSTEM MESSAGE',
      message: 'This is a system notification',
      details: 'It will auto-dismiss after 5 seconds',
      notificationType: 'SYSTEM',
      duration: 5000
    });
  };

  // Demo for error notification
  const handleErrorNotification = () => {
    signet.showNotification({
      title: 'ERROR',
      message: 'Something went wrong',
      details: 'Could not complete the operation',
      notificationType: 'ERROR',
      duration: 8000
    });
  };

  // Demo for transaction notification
  const handleTransactionNotification = () => {
    signet.showNotification({
      title: 'OP_TRANSFER',
      message: 'Please confirm this transaction',
      details: 'Send 0.1 sBTC to SP123456789',
      notificationType: 'OP_TRANSFER'
    })?.then(response => {
      setResponse(response);
    });
  };

  // Demo for basic prediction market
  const handlePredictionMarket = () => {
    signet.createMarketPrediction({
      marketId: 'market-123',
      marketName: 'Will ETH reach $10k by EOY?',
      outcomeId: 1,
      outcomeName: 'Yes',
      amount: 100
    }).then(response => {
      setResponse(response);
    });
  };

  // Demo for rich notification with image
  const handleRichNotification = () => {
    signet.createRichNotification({
      title: 'NFT PURCHASE',
      message: 'You have received an NFT receipt',
      notificationType: 'SYSTEM',
      duration: 10000,
      imageUrl: 'https://placehold.co/600x400/50fa7b/1a1a1a?text=NFT+Receipt',
      htmlContent: `
        <div style="text-align: center; padding: 10px;">
          <h3 style="color: #50fa7b; margin-bottom: 10px;">Prediction Receipt</h3>
          <p style="margin: 5px 0;">Your prediction has been recorded on the blockchain.</p>
          <div style="margin-top: 10px; padding: 8px; background: rgba(80, 250, 123, 0.1); border-radius: 4px;">
            <div style="color: #f1fa8c; font-family: monospace; font-size: 10px;">
              TxHash: 0x71c...9e3f
            </div>
          </div>
        </div>
      `,
      actions: [
        {
          id: 'view',
          label: 'VIEW DETAILS',
          action: 'approve',
          color: 'rgb(80, 250, 123)'
        },
        {
          id: 'dismiss',
          label: 'DISMISS',
          action: 'dismiss'
        }
      ]
    })?.then(response => {
      if (response) {
        setResponse(response);
      }
    });
  };

  // Demo for enhanced wallet update
  const handleSimulateWalletUpdate = () => {
    // This is just for demonstration purposes
    // In a real app, wallet updates come from the extension
    if (typeof window !== 'undefined') {
      window.postMessage({
        type: 'WALLET_UPDATE',
        address: 'sp1abcdef1234567890abcdef1234567890abcdef',
        balance: '1240.50',
        previousBalance: '1200.50',
        delta: '+40.00',
        reason: 'PREDICTION_WIN',
        relatedTransaction: {
          id: 'tx-987654321',
          type: 'MARKET_RESOLUTION',
          timestamp: Date.now(),
          marketId: 'market-456',
          marketName: 'Will ETH merge by EOY?'
        }
      }, '*');

      // Show a notification to inform the user
      signet.showNotification({
        title: 'WALLET UPDATE SIMULATED',
        message: 'A simulated wallet update was sent',
        details: 'Check the wallet info badge to see the update',
        notificationType: 'SYSTEM',
        duration: 3000
      });
    }
  };

  // Demo for 3D cube
  const handleShow3D = () => {
    signet.show3D('rgb(125, 249, 255)', 5000);
  };

  // Demo for toggling extension
  const handleToggleExtension = () => {
    signet.toggleExtension();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Signet Demo</CardTitle>
        <CardDescription>
          Test the Signet extension with these examples
        </CardDescription>
        <div className="flex items-center mt-2">
          <Badge variant={signet.isAvailable ? "success" : "destructive"}>
            {signet.isAvailable ? "Extension Available" : "Extension Not Detected"}
          </Badge>

          {signet.walletInfo && (
            <div className="flex items-center ml-2 gap-2">
              <Badge variant="outline">
                Balance: {signet.walletInfo.balance}
              </Badge>
              {signet.walletInfo.delta && (
                <Badge variant={signet.walletInfo.delta.startsWith('+') ? "success" : "destructive"}>
                  {signet.walletInfo.delta}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="grid grid-cols-2 gap-2">
            <Button onClick={handleSystemNotification}>
              System Message
            </Button>

            <Button onClick={handleErrorNotification} variant="destructive">
              Error Message
            </Button>

            <Button onClick={handleTransactionNotification} variant="outline">
              Transaction
            </Button>

            <Button onClick={handlePredictionMarket} variant="secondary">
              Prediction
            </Button>

            <Button onClick={handleShow3D} variant="ghost">
              Show 3D Cube
            </Button>

            <Button onClick={handleToggleExtension} variant="outline">
              Toggle Extension
            </Button>
          </TabsContent>

          <TabsContent value="enhanced" className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleRichNotification}
              variant="secondary"
              className="col-span-2"
            >
              Rich Notification with Image
            </Button>

            <Button
              onClick={handleSimulateWalletUpdate}
              variant="outline"
              className="col-span-2"
            >
              Simulate Wallet Update
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>

      {response && (
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm font-medium">Last Response:</p>
          <pre className="text-xs mt-2 bg-slate-100 dark:bg-slate-800 p-2 rounded w-full overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </CardFooter>
      )}
    </Card>
  );
}