"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddStaffCard from "../components/AddStaff"; // Make sure the path is correct

export default function AddStaffSection() {
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => setShowForm(prev => !prev);

  return (
    <div className="w-full flex flex-col items-center mt-6">
      <Button onClick={toggleForm} className="flex items-center gap-2 mb-4">
        <Plus className="w-4 h-4" />
        {showForm ? "Close Form" : "Add New Staff"}
      </Button>

      {showForm && <AddStaffCard />}
    </div>
  );
}
