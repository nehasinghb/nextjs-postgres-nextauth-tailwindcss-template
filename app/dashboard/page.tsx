// app/dashboard/page.tsx
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, BarChart, Settings, CreditCard, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Learning and Performance Card */}
      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>Learning & Performance</CardTitle>
          <CardDescription>
            Manage training resources and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Link href="/dashboard/products/learning-templates">
            <div className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <BookOpen className="h-5 w-5 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Manage Learning Templates</p>
                <p className="text-sm text-muted-foreground">
                  Create and manage learning paths and content templates
                </p>
              </div>
            </div>
          </Link>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <BarChart className="h-5 w-5 text-primary" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">Evaluation</p>
              <p className="text-sm text-muted-foreground">
                Review and assess participant progress and achievements
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">Performance</p>
              <p className="text-sm text-muted-foreground">
                Track and analyze user performance metrics and KPIs
              </p>
            </div>
          </div>
        </CardContent>

      </Card>

      {/* User Management Card */}
      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage users, profiles, and account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <Users className="h-5 w-5 text-primary" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">User Profiles</p>
              <p className="text-sm text-muted-foreground">
                Manage user accounts, roles, and access permissions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <Settings className="h-5 w-5 text-primary" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">Settings</p>
              <p className="text-sm text-muted-foreground">
                Configure system preferences and organization settings
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">Subscription Management</p>
              <p className="text-sm text-muted-foreground">
                View and manage subscription plans and billing details
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Manage Users
          </Button>
        </CardFooter>
      </Card>

      {/* Quick Stats Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Dashboard statistics and quick insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md border p-4">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold">28</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md border p-4">
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">76%</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">842</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View Detailed Reports
          </Button>
        </CardFooter>
      </Card>

      {/* Recent Activity Card - Full Width */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system updates and user activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">
                      {["New user registered", "Course completed", "Template updated", "Evaluation added", "Subscription renewed"][i-1]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {`${i} ${i === 1 ? 'hour' : 'hours'} ago`}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[
                      "John Doe has registered as a new instructor.",
                      "Sarah Johnson completed 'Advanced Leadership' course.",
                      "The 'Technical Skills' template was updated with new content.",
                      "Mark Wilson added a new evaluation criteria for the development team.",
                      "Enterprise plan subscription was automatically renewed."
                    ][i-1]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Activity
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}