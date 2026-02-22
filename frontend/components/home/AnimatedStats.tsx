import React from 'react';
import { PackageCheck, Smile, TimerReset, Users } from 'lucide-react';
import CountUpOnView from '../CountUpOnView';
import { HomeStatItem } from '../../services/homeContentService';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smile,
  TimerReset,
  Users,
  PackageCheck,
};

interface AnimatedStatsProps {
  stats?: HomeStatItem[];
}

const AnimatedStats = ({ stats = [] }: AnimatedStatsProps) => {
  return (
    <section className="py-16 bg-gradient-to-r from-brand-50 via-white to-brand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((item) => {
            const Icon = iconMap[item.icon || "PackageCheck"] || PackageCheck;
            return (
              <div
                key={item.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 mx-auto mb-4 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-3xl md:text-4xl font-black text-gray-900">
                  <CountUpOnView end={item.value} suffix={item.suffix} />
                </p>
                <p className="mt-2 text-gray-600 font-medium">{item.label}</p>
              </div>
            );
          })}
          {stats.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              Stats are not configured yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnimatedStats;
