/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Menu,
  X,
  User,
  Users,
  CalendarCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

import AssignHomeworkPage from '../Components/Homework';
import HomeworkSubmissionsWrapper from '../Components/viewhomeworks';
import StaffProfile from '../Components/staffProfile';
import StudentsByClassList from '../Components/studentsByClass';
import AttendanceManager from '../Components/AttendanceUpdate';
import PerformanceUpdateForm from './PerformanceUpdate';
import Results from './getPerformance';

const staffLinks = [
  { name: 'Assign Homework', component: 'homework', icon: <BookOpen size={16} /> },
  { name: 'View Submissions', component: 'submissions', icon: <FileText size={16} /> },
  { name: 'Students by Class', component: 'students', icon: <Users size={16} /> },
  { name: 'Update Attendance', component: 'attendance', icon: <CalendarCheck size={16} /> },
  { name: 'Update Performance', component: 'performance', icon: <FileText size={16} /> },
  { name: 'Student Results', component: 'results', icon: <FileText size={16} /> },
];

export default function StaffSidebar() {
  const [activeComponent, setActiveComponent] = useState('homework');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [staffProfile, setStaffProfile] = useState({
    fullName: '',
    profilePicture: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('http://localhost:5000/api/staff/profile/staff', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        setStaffProfile({
          fullName: data.fullName || 'No Name',
          profilePicture: data.profilePicture?.imageUrl || '/placeholder.jpg',
        });
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setErrorProfile(err.message);
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile();
  }, []);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'homework':
        return <AssignHomeworkPage />;
      case 'submissions':
        return <HomeworkSubmissionsWrapper />;
      case 'students':
        return <StudentsByClassList />;
      case 'attendance':
        return <AttendanceManager />;
      case 'performance':
        return <PerformanceUpdateForm  />; // replace with real ID
      case 'results':
        return <Results />;
      case 'profile':
        return <StaffProfile />;
      default:
        return null;
    }
  };

  const ProfileButton = () => (
    <div
      className="mt-auto pt-4 border-t flex items-center gap-3 cursor-pointer hover:bg-muted/60 rounded-md p-2"
      onClick={() => setActiveComponent('profile')}
    >
      {loadingProfile ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : errorProfile ? (
        <div className="text-sm text-red-500">Error loading profile</div>
      ) : (
        <>
          <img
            src={staffProfile.profilePicture}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover shadow-xl"
          />
          <div className="flex flex-col">
            <span className="font-medium text-sm">{staffProfile.fullName}</span>
            <span className="text-xs text-primary underline hover:text-primary/80 flex items-center gap-1">
              <User size={14} />
              View Profile
            </span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40 p-4">
        <div className="mb-6 text-lg font-semibold text-muted-foreground uppercase">
          Staff Panel
        </div>
        <nav className="flex flex-col gap-2">
          {staffLinks.map(({ name, component, icon }) => (
            <button
              key={component}
              onClick={() => setActiveComponent(component)}
              className={cn(
                buttonVariants({
                  variant: activeComponent === component ? 'default' : 'ghost',
                }),
                'w-full justify-start gap-2 text-left'
              )}
            >
              {icon}
              {name}
            </button>
          ))}
        </nav>
        <ProfileButton />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden w-full flex items-center justify-between p-4 border-b bg-muted/40 relative z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <Menu />
          </button>
          <div className="text-lg font-semibold text-muted-foreground uppercase">
            {staffLinks.find(link => link.component === activeComponent)?.name === undefined && activeComponent === 'profile'
              ? 'Profile'
              : staffLinks.find(link => link.component === activeComponent)?.name || 'Staff Panel'}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-white z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-background shadow-lg z-50 flex flex-col transform transition-transform duration-300 md:hidden',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <span className="text-lg font-bold">Staff Panel</span>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <X />
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-4 flex-grow">
          {staffLinks.map(({ name, component, icon }) => (
            <button
              key={component}
              onClick={() => {
                setActiveComponent(component);
                setMobileSidebarOpen(false);
              }}
              className={cn(
                buttonVariants({
                  variant: activeComponent === component ? 'default' : 'ghost',
                }),
                'w-full justify-start gap-2 text-left'
              )}
            >
              {icon}
              {name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <ProfileButton />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">{renderComponent()}</main>
    </div>
  );
}
