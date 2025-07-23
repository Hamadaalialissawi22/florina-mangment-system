import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, DollarSign, User, Store as StoreIcon, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PendingSettlement {
  id: string;
  type: 'store' | 'employee';
  name: string;
  totalAmount: number;
  itemCount: number;
  lastWithdrawal: string;
  billingCycle?: 'daily' | 'monthly';
}

const SettlementSystem: React.FC = () => {
  const { user } = useAuth();
  const [pendingSettlements, setPendingSettlements] = useState<PendingSettlement[]>([]);
  const [selectedSettlement, setSelectedSettlement] = useState<PendingSettlement | null>(null);
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    loadPendingSettlements();
  }, []);

  const loadPendingSettlements = async () => {
    // Mock data - would be replaced with Supabase query
    const mockSettlements: PendingSettlement[] = [
      {
        id: 'store_1',
        type: 'store',
        name: 'محل النور',
        totalAmount: 245.50,
        itemCount: 18,
        lastWithdrawal: '2024-01-15T14:30:00Z',
      },
      {
        id: 'store_2',
        type: 'store',
        name: 'محل الفردوس',
        totalAmount: 189.75,
        itemCount: 14,
        lastWithdrawal: '2024-01-15T16:45:00Z',
      },
      {
        id: 'employee_1',
        type: 'employee',
        name: 'أحمد محمد',
        totalAmount: 85.00,
        itemCount: 12,
        lastWithdrawal: '2024-01-15T13:20:00Z',
        billingCycle: 'daily',
      },
      {
        id: 'employee_2',
        type: 'employee',
        name: 'فاطمة أحمد',
        totalAmount: 156.25,
        itemCount: 21,
        lastWithdrawal: '2024-01-15T15:10:00Z',
        billingCycle: 'daily',
      },
      {
        id: 'employee_3',
        type: 'employee',
        name: 'محمد علي',
        totalAmount: 420.00,
        itemCount: 45,
        lastWithdrawal: '2024-01-15T17:00:00Z',
        billingCycle: 'monthly',
      },
    ];
    setPendingSettlements(mockSettlements);
  };

  const handleSettlement = (settlement: PendingSettlement) => {
    setSelectedSettlement(settlement);
    setShowConfirmation(true);
  };

  const confirmSettlement = async () => {
    if (!selectedSettlement || !user) return;

    try {
      // Here would be the Supabase logic to:
      // 1. Create a settlement record
      // 2. Clear the pending withdrawals
      // 3. Update the settlement history

      console.log('Processing settlement:', {
        settlement: selectedSettlement,
        processedBy: user.email,
        notes,
        timestamp: new Date().toISOString(),
      });

      // Remove from pending settlements
      setPendingSettlements(prev => 
        prev.filter(s => s.id !== selectedSettlement.id)
      );

      // Reset form
      setSelectedSettlement(null);
      setNotes('');
      setShowConfirmation(false);

      alert('تم إجراء التسوية بنجاح');
    } catch (error) {
      console.error('Error processing settlement:', error);
      alert('حدث خطأ أثناء معالجة التسوية');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">نظام التسويات</h1>
        <div className="text-gray-600">
          التسويات المعلقة: {pendingSettlements.length}
        </div>
      </div>

      {/* Pending Settlements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pendingSettlements.map((settlement) => (
          <div
            key={settlement.id}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                {settlement.type === 'store' ? (
                  <StoreIcon className="w-6 h-6 text-emerald-600" />
                ) : (
                  <User className="w-6 h-6 text-blue-600" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{settlement.name}</h3>
                  <p className="text-sm text-gray-600">
                    {settlement.type === 'store' ? 'محل مجاور' : 'موظف'}
                    {settlement.billingCycle && (
                      <span className={`mr-2 px-2 py-1 rounded-full text-xs ${
                        settlement.billingCycle === 'daily' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {settlement.billingCycle === 'daily' ? 'يومي' : 'شهري'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">إجمالي المبلغ:</span>
                </div>
                <span className="font-bold text-lg text-red-600">
                  {settlement.totalAmount.toFixed(2)} ريال
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <Calculator className="w-4 h-4" />
                  <span className="text-sm">عدد العناصر:</span>
                </div>
                <span className="font-medium">{settlement.itemCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">آخر سحب:</span>
                </div>
                <span className="text-sm">{formatDate(settlement.lastWithdrawal)}</span>
              </div>
            </div>

            <button
              onClick={() => handleSettlement(settlement)}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
            >
              <CheckCircle className="w-4 h-4" />
              <span>إجراء التسوية</span>
            </button>
          </div>
        ))}
      </div>

      {pendingSettlements.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد تسويات معلقة</h3>
          <p className="text-gray-600">جميع الحسابات مسوّاة</p>
        </div>
      )}

      {/* Settlement Confirmation Modal */}
      {showConfirmation && selectedSettlement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">تأكيد التسوية</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">الاسم:</span>
                <span className="font-medium">{selectedSettlement.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">النوع:</span>
                <span className="font-medium">
                  {selectedSettlement.type === 'store' ? 'محل مجاور' : 'موظف'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المبلغ الإجمالي:</span>
                <span className="font-bold text-red-600">
                  {selectedSettlement.totalAmount.toFixed(2)} ريال
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">عدد العناصر:</span>
                <span className="font-medium">{selectedSettlement.itemCount}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="أضف أي ملاحظات حول التسوية..."
              />
            </div>

            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={confirmSettlement}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                تأكيد التسوية
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setSelectedSettlement(null);
                  setNotes('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementSystem;