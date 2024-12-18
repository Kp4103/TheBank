import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { sender: { email: email } },
          { receiver: { email: email } }
        ]
      },
      include: {
        sender: { select: { email: true } },
        receiver: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedTransactions = transactions.map((t: {
      id: number;
      amount: number;
      createdAt: Date;
      sender: { email: string };
      receiver: { email: string };
    }) => ({
      id: t.id,
      amount: t.amount,
      senderId: t.sender.email,
      receiverId: t.receiver.email,
      createdAt: t.createdAt.toISOString()
    }))

    return NextResponse.json({ transactions: formattedTransactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

