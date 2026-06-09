"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { joinWaitlist } from "@/app/actions/waitlist"
import { Loader2, CheckCircle2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  wants_reminder: z.boolean().default(false),
})

interface WaitlistFormProps {
  variant?: "default" | "compact"
}

export function WaitlistForm({ variant = "default" }: WaitlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wants_reminder: false,
    },
  })

  const wantsReminder = watch("wants_reminder")

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    
    const formData = new FormData()
    formData.append("email", values.email)
    if (values.wants_reminder) {
      formData.append("wants_reminder", "on")
    }

    const result = await joinWaitlist(formData)

    setIsSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      setIsSuccess(true)
      toast.success("You've been added to the waitlist!")
      reset()
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-primary/5 rounded-3xl border border-primary/20 space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl text-primary font-bold">You're on the list!</h3>
        <p className="text-muted-foreground text-center text-sm max-w-sm">
          Thank you for joining. We will keep you updated when our live sessions reopen.
        </p>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Input 
                {...register("email")}
                type="email" 
                placeholder="Join waitlist (your@email.com)" 
                className="rounded-full bg-background/50 border-primary/20 focus-visible:ring-primary/50"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="rounded-full px-6 font-semibold bg-primary hover:bg-primary/90 text-white shrink-0"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
            </Button>
          </div>
          {errors.email && (
            <p className="text-xs text-destructive px-2">{errors.email.message}</p>
          )}
          
          <div className="flex items-start space-x-2 px-2">
            <Checkbox 
              id="wants_reminder_compact" 
              checked={wantsReminder}
              onCheckedChange={(checked) => setValue("wants_reminder", checked === true)}
              className="mt-0.5 h-4 w-4 border-primary/40 text-primary data-[state=checked]:bg-primary"
            />
            <Label 
              htmlFor="wants_reminder_compact" 
              className="text-xs font-normal leading-tight text-muted-foreground cursor-pointer select-none"
            >
              Notify me of upcoming sessions or new offerings.
            </Label>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 bg-card/50 backdrop-blur-sm p-8 rounded-3xl border border-primary/10 shadow-xl">
      <div className="space-y-2 text-center">
        <h3 className="font-serif text-2xl font-bold text-primary">Join the Waitlist</h3>
        <p className="text-muted-foreground text-sm">
          Enter your email to be notified when slots open.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1">
          <Input 
            {...register("email")}
            type="email" 
            placeholder="your@email.com" 
            className="rounded-full px-6 py-6 bg-background/50 border-primary/20 focus-visible:ring-primary/50 text-base"
          />
          {errors.email && (
            <p className="text-sm text-destructive px-4 pt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div className="flex items-start space-x-3 px-2 pt-2">
          <Checkbox 
            id="wants_reminder" 
            checked={wantsReminder}
            onCheckedChange={(checked) => setValue("wants_reminder", checked === true)}
            className="mt-1 border-primary/40 text-primary data-[state=checked]:bg-primary"
          />
          <Label 
            htmlFor="wants_reminder" 
            className="text-sm font-normal leading-snug text-muted-foreground cursor-pointer select-none"
          >
            Please send me a reminder email when services reopen (like upcoming sessions or new offerings).
          </Label>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full rounded-full py-6 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Joining...
            </>
          ) : (
            "JOIN WAITLIST"
          )}
        </Button>
      </form>
    </div>
  )
}
