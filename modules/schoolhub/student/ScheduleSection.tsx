import { FUICard } from "../../../components/shared/FUICard";
import { HUDMetric } from "../../../components/shared/HUDMetric";
import { Badge } from "../../../components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, BookOpen, User, Bell, ChevronLeft, ChevronRight } from "lucide-react";

const scheduleData = {
  today: "Monday, March 18, 2024",
  currentTime: "10:30 AM",
  nextClass: {
    name: "Advanced Mathematics",
    code: "MATH-301",
    time: "11:00 AM - 12:30 PM",
    room: "Math Building 204",
    instructor: "Dr. Sarah Chen"
  }
};

const weeklySchedule = [
  {
    day: "Monday",
    date: "Mar 18",
    classes: [
      { time: "09:00-10:30", name: "Computer Science", code: "CS-201", room: "Tech Lab 105", instructor: "Prof. Johnson" },
      { time: "11:00-12:30", name: "Advanced Mathematics", code: "MATH-301", room: "Math Bldg 204", instructor: "Dr. Chen", current: true },
      { time: "14:00-15:30", name: "Physics Laboratory", code: "PHYS-201L", room: "Physics Lab 2", instructor: "Dr. Rodriguez" }
    ]
  },
  {
    day: "Tuesday",
    date: "Mar 19", 
    classes: [
      { time: "10:00-11:30", name: "English Literature", code: "ENG-301", room: "Humanities 101", instructor: "Prof. Williams" },
      { time: "13:00-14:30", name: "Chemistry", code: "CHEM-201", room: "Chemistry Lab", instructor: "Dr. Thompson" },
      { time: "15:00-16:30", name: "Statistics", code: "STAT-201", room: "Math Bldg 105", instructor: "Prof. Davis" }
    ]
  },
  {
    day: "Wednesday",
    date: "Mar 20",
    classes: [
      { time: "09:00-10:30", name: "Computer Science", code: "CS-201", room: "Tech Lab 105", instructor: "Prof. Johnson" },
      { time: "11:00-12:30", name: "Advanced Mathematics", code: "MATH-301", room: "Math Bldg 204", instructor: "Dr. Chen" },
      { time: "16:00-17:30", name: "Research Methods", code: "RES-301", room: "Library 301", instructor: "Dr. Wilson" }
    ]
  },
  {
    day: "Thursday",
    date: "Mar 21",
    classes: [
      { time: "10:00-11:30", name: "English Literature", code: "ENG-301", room: "Humanities 101", instructor: "Prof. Williams" },
      { time: "13:00-14:30", name: "Chemistry", code: "CHEM-201", room: "Chemistry Lab", instructor: "Dr. Thompson" },
      { time: "15:00-16:30", name: "Statistics", code: "STAT-201", room: "Math Bldg 105", instructor: "Prof. Davis" }
    ]
  },
  {
    day: "Friday",
    date: "Mar 22",
    classes: [
      { time: "09:00-10:30", name: "Computer Science", code: "CS-201", room: "Tech Lab 105", instructor: "Prof. Johnson" },
      { time: "11:00-12:30", name: "Advanced Mathematics", code: "MATH-301", room: "Math Bldg 204", instructor: "Dr. Chen" },
      { time: "14:00-15:30", name: "Capstone Project", code: "CAP-401", room: "Project Lab", instructor: "Prof. Martinez" }
    ]
  }
];

const upcomingAssignments = [
  { course: "CS-201", title: "Algorithm Analysis", due: "Tomorrow", priority: "high" },
  { course: "MATH-301", title: "Calculus Problem Set", due: "Mar 20", priority: "medium" },
  { course: "ENG-301", title: "Essay: Modern Literature", due: "Mar 22", priority: "medium" },
  { course: "PHYS-201L", title: "Lab Report #3", due: "Mar 24", priority: "low" }
];

export function ScheduleSection() {
  const totalClasses = weeklySchedule.reduce((sum, day) => sum + day.classes.length, 0);
  const uniqueCourses = new Set(weeklySchedule.flatMap(day => day.classes.map(cls => cls.code))).size;
  
  return (
    <div className="space-y-6">
      {/* Header with current status */}
      <FUICard variant="primary" glowing>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/20 border border-primary/30">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">My Schedule</h2>
              <p className="text-muted-foreground">{scheduleData.today} • {scheduleData.currentTime}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>
      </FUICard>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <HUDMetric
          label="Weekly Classes"
          value={totalClasses}
          icon={<BookOpen className="w-5 h-5" />}
          trend="neutral"
        />
        <HUDMetric
          label="Active Courses"
          value={uniqueCourses}
          icon={<BookOpen className="w-5 h-5" />}
          trend="neutral"
        />
        <HUDMetric
          label="Credits Enrolled"
          value="18"
          icon={<Calendar className="w-5 h-5" />}
          trend="neutral"
        />
        <HUDMetric
          label="Attendance Rate"
          value="96%"
          icon={<Clock className="w-5 h-5" />}
          trend="up"
          trendValue="2%"
        />
      </div>

      {/* Next class alert */}
      <FUICard variant="warning" glowing>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-orange-500/20 border border-orange-500/30">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Next Class</h3>
              <p className="text-sm text-muted-foreground">Starting in 30 minutes</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-foreground">{scheduleData.nextClass.name}</div>
            <div className="text-sm text-muted-foreground">{scheduleData.nextClass.time}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {scheduleData.nextClass.room}
            </div>
          </div>
        </div>
      </FUICard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly schedule */}
        <div className="lg:col-span-2">
          <FUICard title="Weekly Schedule">
            <div className="space-y-1">
              {weeklySchedule.map((day) => (
                <div key={day.day} className="border border-border/30 rounded-lg overflow-hidden">
                  <div className="bg-muted/20 px-4 py-2 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{day.day}</h4>
                      <span className="text-sm text-muted-foreground">{day.date}</span>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-border/20">
                    {day.classes.map((cls, index) => (
                      <div 
                        key={index}
                        className={`p-3 hover:bg-muted/10 transition-colors ${
                          cls.current ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{cls.name}</span>
                              <Badge variant="outline" className="text-xs">{cls.code}</Badge>
                              {cls.current && (
                                <Badge variant="secondary" className="text-xs">Current</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {cls.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {cls.room}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {cls.instructor}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FUICard>
        </div>

        {/* Sidebar with additional info */}
        <div className="space-y-4">
          {/* Upcoming assignments */}
          <FUICard title="Upcoming Assignments">
            <div className="space-y-3">
              {upcomingAssignments.map((assignment, index) => (
                <div key={index} className="p-3 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">{assignment.course}</Badge>
                    <Badge 
                      variant={
                        assignment.priority === 'high' ? 'destructive' : 
                        assignment.priority === 'medium' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {assignment.priority}
                    </Badge>
                  </div>
                  <div className="font-medium text-foreground text-sm">{assignment.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">Due: {assignment.due}</div>
                </div>
              ))}
            </div>
          </FUICard>

          {/* Quick actions */}
          <FUICard title="Quick Actions">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                View Full Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Course Materials
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Contact Instructors
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-2" />
                Notification Settings
              </Button>
            </div>
          </FUICard>
        </div>
      </div>
    </div>
  );
}