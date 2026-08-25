'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, XCircle, AlertCircle, Sparkles, UserCheck, ShieldCheck, Eye, EyeOff } from 'lucide-react'

export type StatusVariant =
  | 'success' // Emerald
  | 'warning' // Amber
  | 'info'    // Blue
  | 'danger'  // Rose/Red
  | 'purple'  // Purple
  | 'neutral' // Gray

interface StatusConfig {
  label: string
  variant: StatusVariant
  dotColor: string
  icon?: React.ReactNode
}

export function getStatusConfig(status: string | null | undefined): StatusConfig {
  const normalized = (status || '').trim().toLowerCase()

  switch (normalized) {
    // PPDB & Payments: Success
    case 'diterima':
    case 'verified':
    case 'lunas':
    case 'active':
    case 'aktif':
    case 'hadir':
    case 'published':
    case 'terbit':
    case 'ditayangkan':
    case 'bsb':
    case 'berkembang sangat baik':
      return {
        label: status || 'Aktif',
        variant: 'success',
        dotColor: 'bg-emerald-500',
        icon: <CheckCircle2 size={12} className="text-emerald-600" />,
      }

    // PPDB & Payments: Pending / Warning / In Progress
    case 'submitted':
    case 'baru':
    case 'baru masuk':
      return {
        label: status || 'Baru Masuk',
        variant: 'info',
        dotColor: 'bg-blue-500',
        icon: <Clock size={12} className="text-blue-600" />,
      }

    case 'verifikasi berkas':
    case 'verifikasi':
    case 'pending':
    case 'menunggu':
    case 'mb':
    case 'mulai berkembang':
    case 'draft':
    case 'tersembunyi':
      return {
        label: status || 'Pending',
        variant: 'warning',
        dotColor: 'bg-amber-500',
        icon: <Clock size={12} className="text-amber-600" />,
      }

    // BSH (Berkembang Sesuai Harapan)
    case 'bsh':
    case 'berkembang sesuai harapan':
      return {
        label: status || 'BSH',
        variant: 'info',
        dotColor: 'bg-blue-500',
        icon: <Sparkles size={12} className="text-blue-600" />,
      }

    // Attendance: Izin
    case 'izin':
      return {
        label: 'Izin',
        variant: 'info',
        dotColor: 'bg-blue-500',
        icon: <AlertCircle size={12} className="text-blue-600" />,
      }

    // Attendance: Sakit
    case 'sakit':
      return {
        label: 'Sakit',
        variant: 'purple',
        dotColor: 'bg-purple-500',
        icon: <AlertCircle size={12} className="text-purple-600" />,
      }

    // Rejections / Inactive / Ditolak / Alfa / BB
    case 'ditolak':
    case 'rejected':
    case 'inactive':
    case 'nonaktif':
    case 'nonaktif / alumni':
    case 'alfa':
    case 'bb':
    case 'belum berkembang':
      return {
        label: status || 'Ditolak',
        variant: 'danger',
        dotColor: 'bg-rose-500',
        icon: <XCircle size={12} className="text-rose-600" />,
      }

    // Roles & Targets
    case 'super_admin':
    case 'super admin':
      return {
        label: 'Super Admin',
        variant: 'purple',
        dotColor: 'bg-purple-500',
        icon: <ShieldCheck size={12} className="text-purple-600" />,
      }

    case 'admin':
    case 'administrator':
      return {
        label: 'Admin',
        variant: 'info',
        dotColor: 'bg-blue-500',
        icon: <ShieldCheck size={12} className="text-blue-600" />,
      }

    case 'guru':
    case 'guru pengajar':
      return {
        label: 'Guru Pengajar',
        variant: 'success',
        dotColor: 'bg-emerald-500',
        icon: <UserCheck size={12} className="text-emerald-600" />,
      }

    case 'orang_tua':
    case 'orang tua':
    case 'orang tua murid':
      return {
        label: 'Orang Tua',
        variant: 'neutral',
        dotColor: 'bg-gray-400',
      }

    case 'semua':
      return {
        label: 'Semua',
        variant: 'info',
        dotColor: 'bg-blue-500',
      }

    default:
      return {
        label: status || 'N/A',
        variant: 'neutral',
        dotColor: 'bg-gray-400',
      }
  }
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200/70 hover:bg-emerald-100/60',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/70 hover:bg-amber-100/60',
  info: 'bg-blue-50 text-blue-800 border-blue-200/70 hover:bg-blue-100/60',
  danger: 'bg-rose-50 text-rose-800 border-rose-200/70 hover:bg-rose-100/60',
  purple: 'bg-purple-50 text-purple-800 border-purple-200/70 hover:bg-purple-100/60',
  neutral: 'bg-gray-50 text-gray-700 border-gray-200/70 hover:bg-gray-100/60',
}

export interface StatusBadgeProps {
  status: string | null | undefined
  customLabel?: string
  showIcon?: boolean
  showDot?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({
  status,
  customLabel,
  showIcon = true,
  showDot = false,
  className,
  size = 'md',
}: StatusBadgeProps) {
  const config = getStatusConfig(status)
  const labelText = customLabel || config.label

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold rounded-full border transition-all select-none shadow-2xs leading-none whitespace-nowrap',
        variantStyles[config.variant],
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)} />
      )}
      {showIcon && config.icon && !showDot && (
        <span className="shrink-0">{config.icon}</span>
      )}
      <span className="truncate">{labelText}</span>
    </span>
  )
}
