import React, { useState } from 'react';
import { SCHOOL_DATA } from '../../../constants';
import { College, Department, Course, Staff } from '../../schoolhub/types';
import GlassCard from '../../../components/GlassCard';
import SchoolL2Sidebar from './components/SchoolL2Sidebar';

const SchoolDirectory: React.FC = () => {
  const [activeL2Item, setActiveL2Item] = useState('school-directory');
  const navItems = [
    { id: 'school-directory', label: 'School Directory' },
    { id: 'colleges', label: 'Colleges' },
    { id: 'departments', label: 'Departments' },
    { id: 'courses', label: 'Courses' },
    { id: 'staff-directory', label: 'Staff Directory' },
    { id: 'academic-calendar', label: 'Academic Calendar' },
    { id: 'campus-map', label: 'Campus Map' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'resources', label: 'Resources' },
    { id: 'policies', label: 'Policies' },
    { id: 'emergency-info', label: 'Emergency Info' },
    { id: 'contact-info', label: 'Contact Info' },
  ];

  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleSelectCollege = (college: College) => {
    setSelectedCollege(college);
    setSelectedDept(null);
    setSelectedCourse(null);
  };
  
  const handleSelectDept = (dept: Department) => {
    setSelectedDept(dept);
    setSelectedCourse(null);
  };

  const ListItem: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ label, isActive, onClick }) => (
    <li
      onClick={onClick}
      className={`p-3 cursor-pointer rounded-md transition-all duration-200 border border-transparent font-medium ${
        isActive
          ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50'
          : 'hover:bg-white/10 hover:text-white'
      }`}
    >
      {label}
    </li>
  );

  return (
    <div className="flex -m-1 sm:-m-2 lg:-m-3 h-full animate-fade-in">
      <SchoolL2Sidebar activeItem={activeL2Item} setActiveItem={setActiveL2Item} navItems={navItems} />
      <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
        <div className="h-full flex flex-col">
          <h2 className="text-3xl font-bold text-white mb-2">School Hub Directory</h2>
          <p className="text-gray-400 mb-6">Navigate the institutional hierarchy. Selections in one column will populate the next.</p>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Level 1: Colleges */}
            <GlassCard className="p-4 flex flex-col">
              <h3 className="text-lg font-semibold text-cyber-cyan border-b-2 border-cyber-cyan/30 pb-2 mb-4">Colleges</h3>
              <ul className="space-y-2 overflow-y-auto">
                {SCHOOL_DATA.map((college) => (
                  <ListItem
                    key={college.id}
                    label={college.name}
                    isActive={selectedCollege?.id === college.id}
                    onClick={() => handleSelectCollege(college)}
                  />
                ))}
              </ul>
            </GlassCard>

            {/* Level 2: Departments */}
            <GlassCard className={`p-4 flex flex-col transition-opacity duration-500 ${selectedCollege ? 'opacity-100' : 'opacity-40'}`}>
              <h3 className="text-lg font-semibold text-cyber-purple border-b-2 border-cyber-purple/30 pb-2 mb-4">Departments</h3>
              <ul className="space-y-2 overflow-y-auto">
                {selectedCollege ? selectedCollege.departments.map((dept) => (
                  <ListItem
                    key={dept.id}
                    label={dept.name}
                    isActive={selectedDept?.id === dept.id}
                    onClick={() => handleSelectDept(dept)}
                  />
                )) : <p className="text-gray-500 italic text-center mt-4">Select a college</p>}
              </ul>
            </GlassCard>

            {/* Level 3: Courses */}
            <GlassCard className={`p-4 flex flex-col transition-opacity duration-500 ${selectedDept ? 'opacity-100' : 'opacity-40'}`}>
              <h3 className="text-lg font-semibold text-cyber-orange border-b-2 border-cyber-orange/30 pb-2 mb-4">Courses</h3>
              <ul className="space-y-2 overflow-y-auto">
                {selectedDept ? selectedDept.courses.map((course) => (
                  <ListItem
                    key={course.id}
                    label={`${course.code} - ${course.name}`}
                    isActive={selectedCourse?.id === course.id}
                    onClick={() => setSelectedCourse(course)}
                  />
                )) : <p className="text-gray-500 italic text-center mt-4">Select a department</p>}
              </ul>
            </GlassCard>

            {/* Level 4: Staff */}
            <GlassCard className={`p-4 flex flex-col transition-opacity duration-500 ${selectedCourse ? 'opacity-100' : 'opacity-40'}`}>
              <h3 className="text-lg font-semibold text-white border-b-2 border-white/30 pb-2 mb-4">Staff Directory</h3>
              <div className="space-y-3 overflow-y-auto">
                {selectedCourse ? selectedCourse.staff.map((staff: Staff) => (
                  <div key={staff.id} className="bg-black/30 p-3 rounded-md">
                    <p className="font-bold text-white">{staff.name}</p>
                    <p className="text-sm text-gray-300">{staff.role}</p>
                    <p className="text-sm text-cyber-cyan font-mono">{staff.email}</p>
                  </div>
                )) : <p className="text-gray-500 italic text-center mt-4">Select a course</p>}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchoolDirectory;