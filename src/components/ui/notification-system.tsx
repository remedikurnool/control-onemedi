
import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Use sonner for toast notifications
    const icon = {
      success: <CheckCircle className="h-4 w-4" />,
      error: <AlertCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />
    }[notification.type];

    toast(notification.title, {
      description: notification.message,
      duration: notification.duration || 5000,
      action: notification.action ? {
        label: notification.action.label,
        onClick: notification.action.onClick
      } : undefined,
      icon,
      className: `toast-${notification.type}`
    });

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Convenience hooks for different notification types
export const useNotify = () => {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'success', title, message, ...options }),
    error: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'error', title, message, ...options }),
    warning: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'warning', title, message, ...options }),
    info: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'info', title, message, ...options }),
  };
};
