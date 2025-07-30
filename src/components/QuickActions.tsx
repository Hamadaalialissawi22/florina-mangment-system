import React from 'react';
import { ShoppingCart, Calculator, Users, Store, Coffee, FileText } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const actions = [
    {
      id: 'new-sale',
      label: 'بيع جديد',
      icon: ShoppingCart,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'إضافة عملية بيع جديدة'
    },
    {
      id: 'settlement',
      label: 'تسوية سريعة',
      icon: Calculator,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      description: 'إجراء تسوية للمحلات أو الموظفين'
    },
    {
      id: 'add-employee',
      label: 'موظف جديد',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'إضافة موظف جديد للنظام'
    },
    {
      id: 'add-store',
      label: 'محل جديد',
      icon: Store,
      color: 'bg-amber-500 hover:bg-amber-600',
      description: 'إضافة محل مجاور جديد'
    },
    {
      id: 'add-product',
      label: 'منتج جديد',
      icon: Coffee,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'إضافة منتج جديد للقائمة'
    },
    {
      id: 'daily-report',
      label: 'تقرير يومي',
      icon: FileText,
      color: 'bg-rose-500 hover:bg-rose-600',
      description: 'عرض التقارير المتقدمة'
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionClick(action.id)}
              className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;