"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Check, X } from "lucide-react"

interface WaitlistEntry {
  id: string
  email: string
  wants_reminder: boolean
  created_at: string
}

interface WaitlistClientProps {
  waitlist: WaitlistEntry[]
}

export function WaitlistClient({ waitlist }: WaitlistClientProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredWaitlist = waitlist.filter((entry) => 
    entry.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="border-primary/10 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <h3 className="text-3xl font-bold font-serif">{waitlist.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full text-green-600">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Opted-in for Reminders</p>
                <h3 className="text-3xl font-bold font-serif">{waitlist.filter(w => w.wants_reminder).length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/10 shadow-md flex flex-col">
        <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-serif text-2xl">Waitlist Signups</CardTitle>
            <CardDescription>All emails collected from the waitlist form.</CardDescription>
          </div>
          <div className="w-full sm:w-64">
            <Input 
              placeholder="Search emails..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="overflow-auto max-h-[700px]">
            <Table>
              <TableHeader className="bg-secondary/30 sticky top-0">
                <TableRow>
                  <TableHead className="font-semibold text-foreground/80 py-4 px-6">Email</TableHead>
                  <TableHead className="font-semibold text-foreground/80 py-4 px-6">Wants Reminders</TableHead>
                  <TableHead className="font-semibold text-foreground/80 py-4 px-6">Date Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWaitlist.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-muted-foreground font-medium">
                      No waitlist entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWaitlist.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-medium px-6">{entry.email}</TableCell>
                      <TableCell className="px-6">
                        {entry.wants_reminder ? (
                          <Badge variant="default" className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20 shadow-none">
                            <Check className="w-3 h-3 mr-1" /> Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-500/10 text-gray-700 hover:bg-gray-500/20 border-gray-500/20 shadow-none">
                            <X className="w-3 h-3 mr-1" /> No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground px-6 text-sm">
                        {format(new Date(entry.created_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
