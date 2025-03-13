"use client";

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  User,
  DollarSign,
  Calendar,
  Trophy,
  Loader2
} from "lucide-react";
import { RedeemPredictionButton } from "./redeem-prediction-button";
import { getMultipleUserStats } from "@/app/actions/leaderboard-actions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type SortField = "date" | "amount" | "outcome" | "user";
type SortDirection = "asc" | "desc";

interface PredictionsTableProps {
  predictions: any[];
  isAdmin?: boolean;
}

export function PredictionsTable({ predictions, isAdmin = false }: PredictionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const itemsPerPage = 10;

  // State for user stats from API
  const [userStats, setUserStats] = useState<Record<string, any>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Extract unique user IDs from predictions
  useEffect(() => {
    async function fetchUserStats() {
      setIsLoadingStats(true);

      try {
        // Extract unique user IDs
        const userIds = predictions
          .map(p => p.userId || p.createdBy)
          .filter(id => !!id); // Remove any undefined/null

        // Remove duplicates
        const uniqueUserIds = Array.from(new Set(userIds));

        if (uniqueUserIds.length === 0) {
          setUserStats({});
          setIsLoadingStats(false);
          return;
        }

        // Fetch stats for all users at once
        const response = await getMultipleUserStats(uniqueUserIds);

        if (response.success && response.stats) {
          setUserStats(response.stats);
        } else {
          console.error("Failed to fetch user stats:", response.error);
          setUserStats({});
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setUserStats({});
      } finally {
        setIsLoadingStats(false);
      }
    }

    fetchUserStats();
  }, [predictions]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sort predictions based on current field and direction
  const sortedPredictions = [...predictions].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case "date":
        // Handle both custody transactions and predictions
        aValue = new Date(a.createdAt || a.takenCustodyAt).getTime();
        bValue = new Date(b.createdAt || b.takenCustodyAt).getTime();
        break;
      case "amount":
        aValue = a.amount;
        bValue = b.amount;
        break;
      case "outcome":
        aValue = a.outcomeName;
        bValue = b.outcomeName;
        break;
      case "user":
        aValue = a.creatorName || a.userId;
        bValue = b.creatorName || b.userId;
        break;
      default:
        aValue = new Date(a.createdAt || a.takenCustodyAt).getTime();
        bValue = new Date(b.createdAt || b.takenCustodyAt).getTime();
    }

    // String comparison for text values
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Numeric comparison for numbers and dates
    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  // Paginate the sorted data
  const totalPages = Math.ceil(sortedPredictions.length / itemsPerPage);
  const paginatedPredictions = sortedPredictions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'pending':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Active</Badge>;
      case 'won':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Won</Badge>;
      case 'lost':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Lost</Badge>;
      case 'redeemed':
      case 'confirmed':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Redeemed</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Submitted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{status}</Badge>;
    }
  };

  // Pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Sort icon helper
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <Card className="w-full overflow-hidden overflow-x-auto">
      <div className="rounded-md min-w-[800px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-[120px] cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                  <SortIcon field="date" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer w-[120px]"
                onClick={() => handleSort("user")}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User
                  <SortIcon field="user" />
                </div>
              </TableHead>
              <TableHead className="w-[70px] text-right">Accuracy</TableHead>
              <TableHead className="w-[70px] text-right">P&L</TableHead>
              <TableHead
                className="cursor-pointer w-[90px]"
                onClick={() => handleSort("outcome")}
              >
                <div className="flex items-center gap-2">
                  Outcome
                  <SortIcon field="outcome" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right w-[90px]"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center gap-2 justify-end">
                  <DollarSign className="h-4 w-4" />
                  Amount
                  <SortIcon field="amount" />
                </div>
              </TableHead>
              <TableHead className="w-[80px]">Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPredictions.length > 0 ? (
              paginatedPredictions.map((prediction) => {
                const isResolved = prediction.status === 'won' || prediction.status === 'lost';
                const isRedeemed = prediction.status === 'redeemed';
                const isWinner = prediction.status === 'won';

                return (
                  <TableRow key={prediction.id}>
                    <TableCell className="font-medium">
                      {formatDate(prediction.createdAt || prediction.takenCustodyAt)}
                    </TableCell>
                    <TableCell>
                      {prediction.creatorName || prediction.userId?.substring(0, 8)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {isLoadingStats ? (
                        <div className="flex justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (() => {
                        // Get the userId from any available field
                        const userId = prediction.userId || prediction.createdBy;
                        if (!userId || !userStats[userId]) return 'N/A';

                        // Use proper accuracy from the server
                        const accuracy = userStats[userId].accuracy || 0;
                        const totalPreds = userStats[userId].totalPredictions || 0;
                        const correctPreds = userStats[userId].correctPredictions || 0;

                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">{`${accuracy.toFixed(1)}%`}</span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="text-xs space-y-1">
                                  <div className="font-medium">Prediction Accuracy</div>
                                  <div>{`${correctPreds} correct out of ${totalPreds} total`}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {isLoadingStats ? (
                        <div className="flex justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (() => {
                        // Get the userId from any available field
                        const userId = prediction.userId || prediction.createdBy;
                        if (!userId || !userStats[userId]) return '$0.00';

                        // Use proper P&L from the server
                        const pnl = userStats[userId].pnl || 0;
                        const totalEarnings = userStats[userId].totalEarnings || 0;
                        const totalAmount = userStats[userId].totalAmount || 0;

                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={`cursor-help ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                                  {`$${pnl.toFixed(2)}`}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="text-xs space-y-1">
                                  <div className="font-medium">Profit & Loss</div>
                                  <div className="text-green-500">{`Winnings: $${totalEarnings.toFixed(2)}`}</div>
                                  <div className="text-red-500">{`Spent: $${totalAmount.toFixed(2)}`}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={prediction.outcomeName === 'Yes' ? 'default' :
                        prediction.outcomeName === 'No' ? 'destructive' : 'secondary'}>
                        {prediction.outcomeName}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              ${prediction.amount?.toFixed(2) || "0.00"}
                              {isWinner && <Trophy className="inline-block h-3 w-3 ml-1 text-green-600" />}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="text-xs space-y-1">
                              <div className="font-medium">Prediction Amount</div>
                              {isWinner && (
                                <div className="text-green-500">
                                  {`Potential payout: $${prediction.potentialPayout?.toFixed(2) || "0.00"}`}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(prediction.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isResolved && !isRedeemed ? (
                        <RedeemPredictionButton
                          predictionId={prediction.id}
                          predictionStatus={prediction.status}
                          marketName={prediction.nftReceipt.marketName}
                          outcomeName={prediction.outcomeName}
                          potentialPayout={prediction.potentialPayout || 0}
                        />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="items-center"
                          asChild
                        >
                          <a href={`/prediction/${prediction.id}`}>
                            View
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No predictions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="items-center"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="items-center"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}