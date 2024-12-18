"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { TransactionWithUsers } from "@/app/actions";

interface TransactionHistoryProps {
  initialTransactions: TransactionWithUsers[];
  onReload: () => Promise<TransactionWithUsers[]>;
  userEmail: string;
}

export default function TransactionHistory({ initialTransactions, onReload, userEmail }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);

  const handleReload = async () => {
    setIsLoading(true);
    try {
      const updatedTransactions = await onReload();
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error("Failed to reload transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(
    transaction => transaction.sender.email === userEmail || transaction.receiver.email === userEmail
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transaction History</CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReload}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <div className="h-[calc(100vh-300px)] overflow-y-auto pr-2">
          <AnimatePresence>
            {filteredTransactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-lg text-gray-500"
              >
                No transactions found.
              </motion.div>
            ) : (
              <motion.ul
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredTransactions.map((transaction, index) => (
                  <motion.li
                    key={transaction.id}
                    className="flex justify-between items-center border-b pb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <div>
                      <p className="font-semibold">
                        {transaction.sender.email === userEmail
                          ? `To: ${transaction.receiver.email}`
                          : `From: ${transaction.sender.email}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`font-bold ${
                        transaction.sender.email === userEmail
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {transaction.sender.email === userEmail ? "-" : "+"}${transaction.amount.toFixed(2)}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

