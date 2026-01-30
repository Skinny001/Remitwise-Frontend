import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react'
import CurrentMoneySplitWidget from '@/components/CurrentMoneySplitWidget'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sent"
            value="$1,200"
            change="+$300 this month"
            icon={<DollarSign className="w-6 h-6" />}
            trend="up"
          />
          <StatCard
            title="Savings"
            value="$360"
            change="+$90 this month"
            icon={<PiggyBank className="w-6 h-6" />}
            trend="up"
          />
          <StatCard
            title="Bills Paid"
            value="$180"
            change="3 bills this month"
            icon={<TrendingUp className="w-6 h-6" />}
            trend="neutral"
          />
          <StatCard
            title="Insurance"
            value="$60"
            change="2 active policies"
            icon={<TrendingDown className="w-6 h-6" />}
            trend="neutral"
          />
        </div>

        {/* Money Split Visualization */}
        {/* Money Split Visualization */}
        <div className="mb-8">
          <CurrentMoneySplitWidget />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            <TransactionItem
              date="2024-01-15"
              description="Remittance to Family"
              amount="$300"
              status="completed"
            />
            <TransactionItem
              date="2024-01-10"
              description="Bill Payment - Electricity"
              amount="$50"
              status="completed"
            />
            <TransactionItem
              date="2024-01-08"
              description="Savings Goal - Education"
              amount="$100"
              status="completed"
            />
          </div>
          <div className="mt-6">
            <Link href="/transactions" className="text-blue-600 hover:text-blue-700 font-semibold">
              View All Transactions →
            </Link>
          </div>
        </div>

        {/* Savings Goals Progress */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Savings Goals</h2>
          <div className="space-y-4">
            <GoalProgress
              name="Education Fund"
              current={360}
              target={1000}
              deadline="2025-12-31"
            />
            <GoalProgress
              name="Medical Emergency"
              current={180}
              target={500}
              deadline="2024-06-30"
            />
          </div>
          <div className="mt-6">
            <Link href="/goals" className="text-blue-600 hover:text-blue-700 font-semibold">
              Manage Goals →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, change, icon, trend }: { title: string, value: string, change: string, icon: React.ReactNode, trend: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-600 text-sm">{title}</div>
        <div className="text-blue-600">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
        {change}
      </div>
    </div>
  )
}



function TransactionItem({ date, description, amount, status }: { date: string, description: string, amount: string, status: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <div className="font-medium text-gray-900">{description}</div>
        <div className="text-sm text-gray-500">{date}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-gray-900">{amount}</div>
        <div className="text-sm text-green-600">{status}</div>
      </div>
    </div>
  )
}

function GoalProgress({ name, current, target, deadline }: { name: string, current: number, target: number, deadline: string }) {
  const percentage = Math.min((current / target) * 100, 100)

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium text-gray-900">{name}</span>
        <span className="text-gray-600 text-sm">${current} / ${target}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div className="bg-green-500 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="text-sm text-gray-500">Target: {deadline}</div>
    </div>
  )
}

