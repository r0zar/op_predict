"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteMarket } from "@/app/actions/market-actions";
import { toast } from "@/lib/utils";

interface DeleteMarketButtonProps {
    marketId: string;
}

export function DeleteMarketButton({ marketId }: DeleteMarketButtonProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteMarket(marketId);

            if (result.success) {
                toast.success("Market deleted successfully");
            } else {
                toast.error("Failed to delete market", {
                    description: result.error || "An unexpected error occurred",
                });
            }
        } catch (error) {
            console.error("Error deleting market:", error);
            toast.error("Something went wrong", {
                description: "Failed to delete the market. Please try again.",
            });
        } finally {
            setIsDeleting(false);
            setOpen(false);
        }
    };

    return (
        <>
            <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-full items-center justify-center"
                onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(true);
                }}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            market and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 