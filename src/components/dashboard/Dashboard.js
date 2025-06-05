import React from 'react';
import PersonalInfo from './PersonalInfo';
import ActivityStatus from './ActivityStatus';
import EmergencyInfo from './EmergencyInfo';
import MemberInfoCard from './MemberInfoCard';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        Member Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow-xl dark:shadow-black/40 rounded-2xl p-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Personal Info
          </h2>
          <PersonalInfo />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl dark:shadow-black/40 rounded-2xl p-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Activity Status
          </h2>
          <ActivityStatus />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl dark:shadow-black/40 rounded-2xl p-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Emergency Info
          </h2>
          <EmergencyInfo />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Member Cards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <MemberInfoCard />
          {/* Add more <MemberInfoCard /> components as needed */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
