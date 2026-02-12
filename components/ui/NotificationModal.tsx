'use client';

import { useEffect, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  operator_name: string;
  note: string;
  product_name: string;
  serial_number: string;
  timestamp: string | Date;
}

interface NotificationModalProps {
  isOpen: boolean;
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead?: () => void;
}

function formatDate(date: string | Date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationModal({
  isOpen,
  notifications,
  onClose,
  onMarkAsRead,
}: NotificationModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <>
      {/* Modal */}
      <div className="fixed bottom-24 left-4 w-96 bg-white rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-left-4 max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">
              Notifikasi ({notifications.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {notifications.map((notif, idx) => (
                <div
                  key={notif.id + idx}
                  className="p-4 hover:bg-gray-50 transition-colors border-l-4 border-amber-400"
                >
                  {/* Message */}
                  <p className="text-gray-900 text-sm mb-2">
                    <span className="font-semibold text-gray-900">
                      {notif.operator_name}
                    </span>
                    {' '}melaporkan kekurangan komponen :{' '}
                    <span className="font-medium text-amber-600">
                      {notif.note}
                    </span>
                    {' '}pada{' '}
                    <span className="font-semibold text-gray-900">
                      {notif.product_name}
                    </span>
                    {' '}dengan serial number :{' '}
                    <span className="font-mono text-gray-600">
                      {notif.serial_number}
                    </span>
                  </p>

                  {/* Timestamp */}
                  <p className="text-xs text-gray-500">
                    {formatDate(notif.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <AlertTriangle className="w-8 h-8 mb-2 text-gray-300" />
              <p className="text-sm">
                Tidak ada laporan penting hari ini
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-200 p-4 text-center">
            <button 
              onClick={onMarkAsRead}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              Tandai sudah dibaca
            </button>
          </div>
        )}
      </div>
    </>
  );
}
