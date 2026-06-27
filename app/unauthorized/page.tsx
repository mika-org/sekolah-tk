import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F6F2] text-[#07265F] p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-extrabold text-red-500">403</h1>
        <h2 className="text-2xl font-bold text-[#07265F]">Akses Ditolak</h2>
        <p className="text-gray-600">
          Anda tidak memiliki izin untuk mengakses halaman ini. Pastikan Anda masuk menggunakan akun dengan role yang sesuai.
        </p>
        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: 'default' }),
              "bg-[#07265F] hover:bg-[#07265F]/95 text-white w-full py-2.5 rounded-xl text-center font-bold text-xs"
            )}
          >
            Kembali ke Login
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              "w-full py-2.5 rounded-xl text-center font-bold text-xs"
            )}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
