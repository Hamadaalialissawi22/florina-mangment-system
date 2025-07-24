import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';

interface OfflineNoticeProps {
  message?: string;
}

const OfflineNotice: React.FC<OfflineNoticeProps> = ({ 
  message = "النظام يعمل في وضع عدم الاتصال. البيانات لن يتم حفظها." 
}) => {
  return (
    <div className="fixed top-20 left-4 right-4 z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg">
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className="flex items-center space-x-2 space-x-reverse">
          <WifiOff className="w-5 h-5 text-amber-600" />
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-amber-800 font-medium">{message}</p>
          <p className="text-amber-700 text-sm mt-1">
            يرجى الاتصال بقاعدة البيانات Supabase لحفظ التغييرات
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflineNotice;