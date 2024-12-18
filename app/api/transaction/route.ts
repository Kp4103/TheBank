import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { receiverEmail, amount } = await req.json()

    const sender = await prisma.user.findUnique({
      where: { id: userId },
    })

    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
    })

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (sender.balance < amount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 })
    }

    const transaction = await prisma.$transaction([
      prisma.user.update({
        where: { id: sender.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.user.update({
        where: { id: receiver.id },
        data: { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          amount,
          senderId: sender.id,
          receiverId: receiver.id,
        },
      }),
    ])

    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    console.error('Error processing transaction:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

