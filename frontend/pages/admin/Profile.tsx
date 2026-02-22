import React from "react";
import { useStore } from "../../store";

const AdminProfile = () => {
  const { user } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500">Your admin account details.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase text-gray-500">Name</p>
          <p className="text-lg font-semibold text-gray-900">{user?.name || "-"}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Email</p>
          <p className="text-lg font-semibold text-gray-900">{user?.email || "-"}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Role</p>
          <p className="text-lg font-semibold text-gray-900">{user?.role || "-"}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">User ID</p>
          <p className="text-lg font-semibold text-gray-900">{user?.id || "-"}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
