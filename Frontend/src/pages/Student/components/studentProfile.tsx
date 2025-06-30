import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Phone, GraduationCap, User, Calendar, Crown } from "lucide-react";

type Student = {
  fullName: string;
  email: string;
  phone: string;
  className: string;
  profilePicture?: string;
  admissionDate?: string;
  isCurrentLeader?: boolean;
};

export default function StudentProfile() {
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("https://vidhyardhi.onrender.com/api/student/profile", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch student profile");

        const data = await res.json();
        setStudent(data);
      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
    };

    fetchProfile();
  }, []);

  if (!student)
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Avatar + Name */}
      <Card className="flex items-center gap-6 p-4 shadow-xl">
        <Dialog>
          <DialogTrigger asChild>
            <Avatar className="w-24 h-24 cursor-pointer ring-4 ring-purple-200">
              {student.profilePicture ? (
                <AvatarImage
                  src={student.profilePicture}
                  alt={`${student.fullName} profile`}
                />
              ) : (
                <AvatarFallback>
                  {student.fullName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </DialogTrigger>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            {student.profilePicture ? (
              <img
                src={student.profilePicture}
                alt={`${student.fullName} full size`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-6 text-center text-gray-500">
                No Image Available
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            {student.fullName}
            {student.isCurrentLeader && (
              <Badge className="bg-yellow-500 text-white animate-pulse flex items-center gap-1">
                <Crown size={14} className="mb-[1px]" />
                Class Leader
              </Badge>
            )}
          </h2>
          <Badge className="mt-2">{student.className}</Badge>
        </div>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardHeader className="flex items-center gap-3 p-0">
            <User className="text-purple-500" />
            <CardTitle>Full Name</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">{student.fullName}</CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="flex items-center gap-3 p-0">
            <Mail className="text-blue-500" />
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">{student.email}</CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="flex items-center gap-3 p-0">
            <Phone className="text-green-500" />
            <CardTitle>Mobile Number</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">{student.phone}</CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="flex items-center gap-3 p-0">
            <GraduationCap className="text-yellow-500" />
            <CardTitle>Class</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">{student.className}</CardContent>
        </Card>

        {student.admissionDate && (
          <Card className="p-4">
            <CardHeader className="flex items-center gap-3 p-0">
              <Calendar className="text-red-500" />
              <CardTitle>Admission Date</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {new Date(student.admissionDate).toLocaleDateString()}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Download Profile Button */}
      <div className="text-center">
        <Button variant="outline" onClick={() => window.print()}>
          Download Profile
        </Button>
      </div>
    </div>
  );
}
