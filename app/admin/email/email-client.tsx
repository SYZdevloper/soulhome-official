"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Send, Mail, CheckCircle2 } from "lucide-react"
import { sendBulkEmail } from "@/app/actions/email"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

interface EmailClientProps {
  emailsSentToday: number
  audienceCounts: {
    global: number
    all_registered: number
    waitlist_all: number
    waitlist_yes: number
    waitlist_no: number
  }
}

const DAILY_LIMIT = 100

export function EmailClient({ emailsSentToday, audienceCounts }: EmailClientProps) {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [content, setContent] = useState("")

  const handleSendEmail = async (formData: FormData) => {
    setIsSending(true)
    
    // The RichTextEditor doesn't automatically put its content in formData since it's not a standard input.
    // We must append it manually.
    if (!content || content === "<p></p>") {
      toast.error("Email message cannot be empty.")
      setIsSending(false)
      return
    }

    formData.append("message", content)

    if (emailsSentToday >= DAILY_LIMIT) {
      toast.error(`Cannot send: Daily limit of ${DAILY_LIMIT} emails reached.`)
      setIsSending(false)
      return
    }

    const result = await sendBulkEmail(formData)
    
    if (result.error) {
      toast.error(result.error)
      setIsSending(false)
    } else {
      toast.success(`Successfully sent emails to ${result.count} users!`)
      setIsSuccess(true)
      setIsSending(false)
      
      // Refresh the server data (limits & counts) without full page reload
      router.refresh()

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSuccess(false)
        setContent("")
        const subjectInput = document.getElementById("subject") as HTMLInputElement
        if (subjectInput) subjectInput.value = ""
      }, 3000)
    }
  }

  const limitPercentage = Math.min((emailsSentToday / DAILY_LIMIT) * 100, 100)

  return (
    <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
      {/* Compose Email Card */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-primary/10 shadow-md">
          <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
            <CardTitle className="font-serif flex items-center gap-2 text-xl">
              <Send className="w-5 h-5 text-primary" /> Compose Email
            </CardTitle>
            <CardDescription>Write beautifully formatted HTML emails. These will be wrapped in your official Soul Home branded template automatically.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={handleSendEmail} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="target">Select Audience</Label>
                <Select name="target" defaultValue="everyone">
                  <SelectTrigger id="target" className="bg-background">
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Global</SelectLabel>
                      <SelectItem value="everyone">Global Broadcast ({audienceCounts.global})</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Registered Users</SelectLabel>
                      <SelectItem value="all_registered">All Registered ({audienceCounts.all_registered})</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Waitlist</SelectLabel>
                      <SelectItem value="waitlist_all">Everyone on Waitlist ({audienceCounts.waitlist_all})</SelectItem>
                      <SelectItem value="waitlist_yes">Waitlist w/ Reminders ({audienceCounts.waitlist_yes})</SelectItem>
                      <SelectItem value="waitlist_no">Waitlist w/o Reminders ({audienceCounts.waitlist_no})</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input id="subject" name="subject" placeholder="A special update from Soul Home..." required className="bg-background text-base" />
              </div>
              
              <div className="space-y-2">
                <Label>Message Content</Label>
                <RichTextEditor 
                  content={content} 
                  onChange={setContent} 
                  placeholder="Type your message here..."
                />
              </div>

              <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg"
                    className={`text-white shadow-xl hover:scale-105 transition-all w-full sm:w-auto ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'}`}
                    disabled={isSending || isSuccess || emailsSentToday >= DAILY_LIMIT}
                  >
                    {isSending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                    ) : isSuccess ? (
                      <><CheckCircle2 className="mr-2 h-5 w-5" /> Sent Successfully!</>
                    ) : (
                      <><Send className="mr-2 h-5 w-5" /> Send to Selected Audience</>
                    )}
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Limits & Help */}
      <div className="space-y-6 lg:col-span-1">
        <Card className="border-primary/10 shadow-md">
          <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
            <CardTitle className="font-serif flex items-center gap-2 text-xl">
              <Mail className="w-5 h-5 text-primary" /> Delivery Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label className="font-semibold text-foreground/80">Daily Email Limit</Label>
                <span className="text-sm font-bold">{emailsSentToday} / {DAILY_LIMIT}</span>
              </div>
              <Progress value={limitPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                You are currently using Resend's free tier, which allows up to 100 emails per day. 
                If you exceed this, the system will block sending to prevent errors.
              </p>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-xl border border-secondary">
               <h4 className="font-semibold text-sm mb-2">How it works</h4>
               <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                  <li><strong>Personalization:</strong> Type <code>{'{name}'}</code> or <code>{'{username}'}</code> anywhere in your email to automatically insert the recipient's first name.</li>
                  <li><strong>Deduplication:</strong> If a user is on both the waitlist and registered, they will only receive 1 email.</li>
                  <li><strong>Formatting:</strong> The HTML you write here is safely wrapped inside your gorgeous #6d28d9 Soul Home email template.</li>
               </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
