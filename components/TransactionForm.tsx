'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { transferMoney, TransactionWithUsers, checkUserExists } from '@/app/actions'
import Modal from './Modal'
import { useUser } from '@clerk/nextjs';

interface TransactionFormProps {
  onTransactionComplete: (newBalance: number, newTransaction: TransactionWithUsers) => Promise<void>;
  currentBalance: number;
}

export default function TransactionForm({onTransactionComplete, currentBalance}: TransactionFormProps) {
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const transferAmount = parseFloat(amount)

    if (user && email === user.emailAddresses[0].emailAddress) {
      setModalMessage('You cannot transfer money to your own account. Please enter a different recipient email.')
      setIsModalOpen(true)
      setIsLoading(false)
      return
    }

    if (transferAmount > currentBalance) {
      setModalMessage('Insufficient balance. Please enter a lower amount.')
      setIsModalOpen(true)
      setIsLoading(false)
      return
    }

    try {
      // Check if the user exists before attempting the transfer
      const userExists = await checkUserExists(email)
      if (!userExists) {
        setModalMessage('The recipient email does not exist in our database. Please check the email address and try again.')
        setIsModalOpen(true)
        setIsLoading(false)
        return
      }

      const result = await transferMoney(email, transferAmount)
      setSuccess('Transaction successful')
      setEmail('')
      setAmount('')
      await onTransactionComplete(result.sender.balance, result)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'Recipient not found') {
          setModalMessage('The recipient email does not exist in our database. Please check the email address and try again.')
        } else if (err.message === 'Insufficient funds') {
          setModalMessage('You do not have sufficient funds for this transaction. Please enter a lower amount or add funds to your account.')
        } else if (err.message === 'Cannot transfer to yourself') {
          setModalMessage('You cannot transfer money to your own account. Please enter a different recipient email.')
        } else {
          setModalMessage(`An error occurred: ${err.message}`)
        }
        setIsModalOpen(true)
      } else {
        setError('An unexpected error occurred. Please try again later.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Make a Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Recipient's Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Send Money'}
              </Button>
            </motion.div>
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-500">{success}</div>}
          </form>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Transaction Error</h2>
        <p className="text-gray-700">{modalMessage}</p>
        <Button onClick={() => setIsModalOpen(false)} className="mt-4 w-full">
          Close
        </Button>
      </Modal>
    </>
  )
}

