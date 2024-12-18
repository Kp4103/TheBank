/* eslint-disable */

'use server'

import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { Prisma, PrismaClient } from '@prisma/client'

export type TransactionWithUsers = {
  id: number;
  amount: number;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  sender: {
    id: string;
    email: string;
    balance: number;
  };
  receiver: {
    id: string;
    email: string;
    balance: number;
  };
};

export type UserWithTransactions = {
  id: string;
  email: string;
  balance: number;
  sentTransactions: TransactionWithUsers[];
  receivedTransactions: TransactionWithUsers[];
};

export async function getUserData(): Promise<UserWithTransactions | null> {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      sentTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { receiver: true, sender: true },
      },
      receivedTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { sender: true, receiver: true },
      },
    },
  })

  return user as UserWithTransactions | null
}

export async function transferMoney(recipientEmail: string, amount: number): Promise<TransactionWithUsers> {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('User not authenticated')
  }

  try {
    const transaction = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const sender = await tx.user.findUnique({
        where: { id: userId },
      })

      if (!sender) {
        throw new Error('Sender not found')
      }

      if (sender.email === recipientEmail) {
        throw new Error('Cannot transfer to yourself')
      }

      if (sender.balance < amount) {
        throw new Error('Insufficient funds')
      }

      const recipient = await tx.user.findUnique({
        where: { email: recipientEmail },
      })

      if (!recipient) {
        throw new Error('Recipient not found')
      }

      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } },
      })

      await tx.user.update({
        where: { id: recipient.id },
        data: { balance: { increment: amount } },
      })

      const newTransaction = await tx.transaction.create({
        data: {
          amount,
          senderId: userId,
          receiverId: recipient.id,
        },
        include: {
          sender: true,
          receiver: true,
        },
      })

      return newTransaction
    })

    console.log('Transfer successful:', transaction)
    return transaction as TransactionWithUsers

  } catch (error) {
    console.error('Transfer failed:', error)
    throw error
  }
}

export async function createNewUser(id: string, email: string): Promise<UserWithTransactions> {
  try {
    const newUser = await prisma.user.create({
      data: {
        id: id,
        email: email,
        balance: 0,
      },
      include: {
        sentTransactions: {
          include: {
            sender: true,
            receiver: true,
          },
        },
        receivedTransactions: {
          include: {
            sender: true,
            receiver: true,
          },
        },
      },
    });

    console.log('New user created:', newUser);
    return {
      ...newUser,
      sentTransactions: newUser.sentTransactions as TransactionWithUsers[],
      receivedTransactions: newUser.receivedTransactions as TransactionWithUsers[],
    };
  } catch (error) {
    console.error('Error creating user in database:', error);
    throw error;
  }
}

export async function getOrCreateUser(id: string, email: string): Promise<UserWithTransactions> {
  try {
    let user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        sentTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { receiver: true, sender: true },
        },
        receivedTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { sender: true, receiver: true },
        },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: id,
          email: email,
          balance: 0,
        },
        include: {
          sentTransactions: {
            include: {
              sender: true,
              receiver: true,
            },
          },
          receivedTransactions: {
            include: {
              sender: true,
              receiver: true,
            },
          },
        },
      });
    }

    return {
      ...user,
      sentTransactions: user.sentTransactions as TransactionWithUsers[],
      receivedTransactions: user.receivedTransactions as TransactionWithUsers[],
    };
  } catch (error) {
    console.error('Error getting or creating user:', error);
    throw error;
  }
}

export async function fetchTransactions(userEmail: string): Promise<TransactionWithUsers[]> {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { sender: { email: userEmail } },
        { receiver: { email: userEmail } }
      ]
    },
    include: {
      sender: true,
      receiver: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return transactions as TransactionWithUsers[]
}

export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    })
    return !!user
  } catch (error) {
    console.error('Error checking user existence:', error)
    throw error
  }
}

