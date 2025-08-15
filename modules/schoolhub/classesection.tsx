import { FUICard } from "../shared/FUICard";
import { HUDMetric } from "../shared/HUDMetric";
import { HUDTable } from "../shared/HUDTable";
import { HUDChart } from "../shared/HUDChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, Calendar, TrendingUp, Eye, MoreHorizontal } from "lucide-react";

const classData = [
  {
    id: "CS-301",
    name: "Advanced Computer Science",
    subject: "Computer Science",
    students: 28,
    schedule: "MWF 10:00-11:30",
    room: "Tech Lab 205",
    semester: "Spring 2024",
    attendance: 94,
    avgGrade: 87.5,
    status: "Active"
  },
  {
    id: "CS-201",
    name: "Data Structures",
    subject: "Computer Science", 
    students: 32,
    schedule: "TTh 14:00-15:30",
    room: "CS Building 102",
    semester: "Spring 2024",
    attendance: 91,
    avgGrade: 83.2,
    status: "Active"
  },
  {
    id: "CS-101",
    name: "Programming Fundamentals",
    subject: "Computer Science",
    students: 45,
    schedule: "MWF 13:00-14:30",
    room: "CS Building 101",
    semester: "Spring 2024",
    attendance: 96,
    avgGrade: 89.1,
    status: "Active"
  }
];

const attendanceData = [
  { name: 'Week 1', value: 95 },
  { name: 'Week 2', value: 94 },
  { name: 'Week 3', value: 92 },
  { name: 'Week 4', value: 96 },
  { name: 'Week 5', value: 93 },
  { name: 'Week 6', value: 94 }
];

const gradeDistribution = [
  { name: 'A (90-100)', value: 35 },
  { name: 'B (80-89)', value: 42 },
  { name: 'C (70-79)', value: 18 },
  { name: 'D (60-69)', value: 4 },
  { name: 'F (0-59)', value: 1 }
];

const columns = [
  {
    key: "id",
    label: "Course ID",
    render: (value: string) => (
      <span className="font-mono text-primary">{value}</span>
    )
  },
  {
    key: "name", 
    label: "Course Name",
    render: (value: string, row: any) => (
      <div>
        <div className="font-medium text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{row.subject}</div>
      </div>
    )
  },
  {
    key: "students",
    label: "Students",
    render: (value: number) => (
      <div className="flex items-center gap-1">
        <Users className="w-3 h-3 text-muted-foreground" />
        <span className="font-mono">{value}</span>
      </div>
    )
  },
  {
    key: "schedule",
    label: "Schedule",
    render: (value: string) => (
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className="text-sm">{value}</span>
      </div>
    )
  },
  {
    key: "attendance",
    label: "Attendance",
    render: (value: number) => (
      <div className="flex items-center gap-2">
        <span className="text-sm">{value}%</span>
        <Badge variant={value >= 95 ? "secondary" : value >= 90 ? "outline" : "destructive"}>
          {value >= 95 ? "Excellent" : value >= 90 ? "Good" : "Needs Attention"}
        </Badge>
      </div>
    )
  },
  {
    key: "avgGrade",
    label: "Avg Grade",
    render: (value: number) => (
      <span className="font-mono text-primary">{value.toFixed(1)}</span>
    )
  },
  {
    key: "actions",
    label: "",
    render: () => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    )
  }
];

export function ClassesSection() {
  const totalStudents = classData.reduce((sum, cls) => sum + cls.students, 0);
  const avgAttendance = Math.round(classData.reduce((sum, cls) => sum + cls.attendance, 0) / classData.length);
  const avgGrade = (classData.reduce((sum, cls) => sum + cls.avgGrade, 0) / classData.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <FUICard variant="primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/20 border border-primary/30">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">My Classes</h2>
              <p className="text-muted-foreground">Spring 2024 Semester • {classData.length} Active Courses</p>
            </div>
          </div>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            View Schedule
          </Button>
        </div>
      </FUICard>

      {/* Quick metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <HUDMetric
          label="Total Classes"
          value={classData.length}
          icon={<BookOpen className="w-5 h-5" />}
          trend="neutral"
        />
        <HUDMetric
          label="Total Students"
          value={totalStudents}
          icon={<Users className="w-5 h-5" />}
          trend="up"
          trendValue="3"
        />
        <HUDMetric
          label="Avg Attendance"
          value={`${avgAttendance}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="up"
          trendValue="1.2%"
        />
        <HUDMetric
          label="Avg Grade"
          value={avgGrade}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="up"
          trendValue="2.3"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class list */}
        <div className="lg:col-span-2">
          <HUDTable
            data={classData}
            columns={columns}
            title="Course Overview"
          />
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          <HUDChart
            data={attendanceData}
            type="line"
            title="Weekly Attendance Trend"
            dataKey="value"
            nameKey="name"
            height={200}
            animated
          />
          
          <FUICard title="Today's Schedule">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <div>
                  <div className="font-medium text-foreground">CS-101</div>
                  <div className="text-xs text-muted-foreground">Programming Fundamentals</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-primary">13:00-14:30</div>
                  <div className="text-xs text-muted-foreground">Room 101</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <div>
                  <div className="font-medium text-foreground">CS-201</div>
                  <div className="text-xs text-muted-foreground">Data Structures</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-primary">14:00-15:30</div>
                  <div className="text-xs text-muted-foreground">Room 102</div>
                </div>
              </div>
            </div>
          </FUICard>
        </div>
      </div>

      {/* Grade distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HUDChart
          data={gradeDistribution}
          type="pie"
          title="Overall Grade Distribution"
          dataKey="value"
          nameKey="name"
          height={300}
          animated
        />

        <FUICard title="Recent Activity">
          <div className="space-y-3">
            {[
              { action: "Graded Assignment 3", class: "CS-301", time: "2 hours ago" },
              { action: "Posted Lecture Notes", class: "CS-201", time: "4 hours ago" },
              { action: "Updated Syllabus", class: "CS-101", time: "1 day ago" },
              { action: "Scheduled Office Hours", class: "All Classes", time: "2 days ago" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/10 transition-colors">
                <div>
                  <div className="font-medium text-foreground">{activity.action}</div>
                  <div className="text-xs text-muted-foreground">{activity.class}</div>
                </div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </div>
        </FUICard>
      </div>

      {/* Individual class cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classData.map((cls) => (
          <FUICard key={cls.id} glowing={cls.attendance >= 95}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{cls.id}</h3>
                  <p className="text-sm text-muted-foreground">{cls.name}</p>
                </div>
                <Badge variant="secondary">{cls.semester}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Students:</span>
                  <span className="text-foreground ml-1">{cls.students}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Room:</span>
                  <span className="text-foreground ml-1">{cls.room}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Attendance:</span>
                  <span className="text-primary ml-1">{cls.attendance}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Grade:</span>
                  <span className="text-primary ml-1">{cls.avgGrade}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Schedule</div>
                <div className="text-sm text-foreground">{cls.schedule}</div>
              </div>
            </div>
          </FUICard>
        ))}
      </div>
    </div>
  );
}