import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { User, Building2, ArrowRight } from "lucide-react"
import Link from "next/link"

interface AccountTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountTypeDialog({ open, onOpenChange }: AccountTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 bg-gradient-to-br from-slate-50 to-white border-0 shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-2">
          <DialogTitle className="text-2xl font-bold text-center text-slate-900 mb-2">
            Choose Your Account Type
          </DialogTitle>
          <p className="text-slate-600 text-center text-sm font-medium">
            Select the account type that best fits your needs
          </p>
        </DialogHeader>

        <div className="px-8 pb-8 pt-6 space-y-4">
          {/* Personal Account Card */}
          <Link href="/signup" className="block group">
            <Card className="border-2 border-slate-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-100 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-cyan-600 transition-colors">
                      Personal Account
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">Perfect for individual users and personal finances</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Business Account Card */}
          <Link href="/signup/business" className="block group">
            <Card className="border-2 border-slate-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-orange-600 transition-colors">
                      Business Account
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">Designed for businesses and organizations</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Additional Info */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center">
              You can always upgrade or change your account type later
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
