"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountBalanceProps {
  balance: number;
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => current.toFixed(2));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export default function AccountBalance({ balance }: AccountBalanceProps) {
  const [prevBalance, setPrevBalance] = useState(balance);

  useEffect(() => {
    setPrevBalance(balance);
  }, [balance]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          className="text-4xl font-bold text-green-600 dark:text-green-400"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          $<AnimatedNumber value={balance} />
          {balance !== prevBalance && (
            <motion.span
              key={balance}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="ml-2 text-sm font-normal"
            >
              {balance > prevBalance ? "▲" : "▼"}
              ${Math.abs(balance - prevBalance).toFixed(2)}
            </motion.span>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}

