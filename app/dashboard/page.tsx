/* eslint-disable */

'use client'

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import Header from '@/components/Header';
import UserInfo from '@/components/UserInfo';
import AccountBalance from '@/components/AccountBalance';
import TransactionForm from '@/components/TransactionForm';
import TransactionHistory from '@/components/TransactionHistory';
import { getOrCreateUser, getUserData, TransactionWithUsers, fetchTransactions, UserWithTransactions } from '@/app/actions';

export default function Dashboard() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [dbUser, setDbUser] = useState<UserWithTransactions | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithUsers[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (isLoaded && userId && user) {
        try {
          const userData = await getOrCreateUser(userId, user.emailAddresses[0].emailAddress);
          setDbUser(userData);
          const fetchedTransactions = await fetchTransactions(user.emailAddresses[0].emailAddress);
          setTransactions(fetchedTransactions);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchData();
  }, [isLoaded, userId, user]);

  const reloadTransactions = async (newBalance: number, newTransaction: TransactionWithUsers) => {
    try {
      const updatedTransactions = await fetchTransactions(user?.emailAddresses[0].emailAddress || '');
      setTransactions(updatedTransactions);
      setDbUser(prevUser => prevUser ? {
        ...prevUser,
        balance: newBalance,
      } : null);
    } catch (error) {
      console.error('Error reloading transactions:', error);
    }
  };

  if (!isLoaded || isLoading) {
    return <div>Loading...</div>;
  }

  if (!userId || !user || !dbUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Welcome, {dbUser.email.split('@')[0]}!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <UserInfo user={dbUser} />
            <AccountBalance balance={dbUser.balance} />
            <TransactionForm 
              onTransactionComplete={reloadTransactions} 
              currentBalance={dbUser.balance}
            />
          </div>
          <TransactionHistory 
            initialTransactions={transactions}
            onReload={async () => {
              const updatedTransactions = await fetchTransactions(user.emailAddresses[0].emailAddress);
              setTransactions(updatedTransactions);
              return updatedTransactions;
            }}
            userEmail={user.emailAddresses[0].emailAddress}
          />
        </div>
      </main>
    </div>
  );
}

