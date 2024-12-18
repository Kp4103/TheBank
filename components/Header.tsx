'use client'

import { motion } from 'framer-motion'
import { UserButton } from "@clerk/nextjs";
import Logo from './Logo'
import { ThemeToggle } from './ThemeToggle'

export default function Header() {
  return (
    <motion.header 
      className="bg-background shadow-md"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Logo />
        </motion.div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/"/>
        </div>
      </div>
    </motion.header>
  )
}

