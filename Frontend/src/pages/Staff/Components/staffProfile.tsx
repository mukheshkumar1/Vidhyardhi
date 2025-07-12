import React, { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  User,
  Users,
  BookOpen,
  BadgeCheck,
  CalendarCheck,
  IndianRupee,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const iconColors = {
  User: 'bg-blue-500 text-white',
  Mail: 'bg-red-500 text-white',
  Phone: 'bg-green-500 text-white',
  BadgeCheck: 'bg-purple-600 text-white',
  Users: 'bg-yellow-500 text-white',
  BookOpen: 'bg-pink-500 text-white',
  CalendarCheck: 'bg-indigo-500 text-white',
  IndianRupee: 'bg-emerald-600 text-white',
};

const StaffProfile: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('https://vidhyardhi.onrender.com/api/staff/profile/staff', {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to fetch staff profile');
        const data = await res.json();
        setStaff(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="p-4 text-center text-lg text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 p-4 text-center font-semibold">{error}</div>
    );
  if (!staff)
    return (
      <div className="text-center text-muted-foreground p-4">
        No profile data found.
      </div>
    );

  const attendance = staff.attendance?.yearly || {};
  const attendancePercentage =
    attendance.presentDays && attendance.workingDays
      ? Math.round((attendance.presentDays / attendance.workingDays) * 100)
      : null;

  // Helper component for colorful icon with label
  const IconLabel = ({
    icon: Icon,
    label,
    colorClass,
  }: {
    icon: React.ElementType;
    label: React.ReactNode;
    colorClass: string;
  }) => (
    <div className="flex items-center gap-3">
      <div
        className={`${colorClass} p-2 rounded-full shadow-md flex items-center justify-center`}
        style={{ minWidth: 36, minHeight: 36 }}
      >
        <Icon size={20} />
      </div>
      <span className="text-gray-700 dark:text-gray-200 font-medium">{label}</span>
    </div>
  );

  return (
    <>
      <div className="w-full flex justify-center mt-10 px-4">
        <Card className="max-w-md w-full rounded-3xl shadow-2xl bg-gradient-to-tr from-white to-indigo-50 dark:from-gray-900 dark:to-indigo-900 border border-indigo-300 dark:border-indigo-700">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
              <img
                src={staff.profilePicture?.imageUrl || '/placeholder.jpg'}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-3 border-4 border-white dark:border-gray-900 shadow-lg">
                <User size={24} className="text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 text-center">
              {staff.fullName}
            </h2>

            <div className="w-full space-y-4">
              <IconLabel
                icon={Mail}
                label={staff.email}
                colorClass={iconColors.Mail}
              />
              <IconLabel
                icon={Phone}
                label={staff.mobileNumber}
                colorClass={iconColors.Phone}
              />
              <IconLabel
                icon={BadgeCheck}
                label={staff.gender.charAt(0).toUpperCase() + staff.gender.slice(1)}
                colorClass={iconColors.BadgeCheck}
              />

              {staff.className && (
                <IconLabel
                  icon={Users}
                  label={
                    <>
                      <span className="mr-1 font-semibold">Class:</span>{' '}
                      {staff.className}
                    </>
                  }
                  colorClass={iconColors.Users}
                />
              )}

              {staff.subjects?.length > 0 && (
                <IconLabel
                  icon={BookOpen}
                  label={staff.subjects.join(', ')}
                  colorClass={iconColors.BookOpen}
                />
              )}

              {attendance && attendance.presentDays !== undefined && (
                <IconLabel
                  icon={CalendarCheck}
                  label={`${attendance.presentDays}/${attendance.workingDays} days (${attendancePercentage}%) attendance`}
                  colorClass={iconColors.CalendarCheck}
                />
              )}

              {staff.salary && (
                <IconLabel
                  icon={IndianRupee}
                  label={`₹${staff.salary.toLocaleString()}`}
                  colorClass={iconColors.IndianRupee}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full max-h-full flex justify-center items-center"
            onClick={e => e.stopPropagation()} // prevent closing modal on image click
            style={{ aspectRatio: '1 / 1' }} // square aspect ratio
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <img
              src={staff.profilePicture?.imageUrl || '/placeholder.jpg'}
              alt="Full size profile"
              className="object-cover w-full h-full rounded-md"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default StaffProfile;
