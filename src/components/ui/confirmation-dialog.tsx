
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Power, PowerOff, Edit, Send } from 'lucide-react';

interface ConfirmationDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'destructive' | 'default';
  icon?: React.ReactNode;
}

interface QuickConfirmationProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'destructive' | 'default';
}

// Main Confirmation Dialog Component
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  trigger,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'default',
  icon
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {icon && icon}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700'
                : undefined
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Quick Confirmation (no trigger, shows immediately)
export const QuickConfirmation: React.FC<QuickConfirmationProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700'
                : undefined
            }
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Predefined Confirmation Dialogs
export const DeleteConfirmation: React.FC<{
  trigger: React.ReactNode;
  itemName: string;
  onConfirm: () => void;
}> = ({ trigger, itemName, onConfirm }) => (
  <ConfirmationDialog
    trigger={trigger}
    title="Delete Item"
    description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
    confirmText="Delete"
    onConfirm={onConfirm}
    variant="destructive"
    icon={<Trash2 className="w-5 h-5" />}
  />
);

export const BulkDeleteConfirmation: React.FC<{
  trigger: React.ReactNode;
  count: number;
  onConfirm: () => void;
}> = ({ trigger, count, onConfirm }) => (
  <ConfirmationDialog
    trigger={trigger}
    title="Bulk Delete"
    description={`Are you sure you want to delete ${count} items? This action cannot be undone.`}
    confirmText="Delete All"
    onConfirm={onConfirm}
    variant="destructive"
    icon={<Trash2 className="w-5 h-5" />}
  />
);

export const ActivateConfirmation: React.FC<{
  trigger: React.ReactNode;
  itemName: string;
  onConfirm: () => void;
}> = ({ trigger, itemName, onConfirm }) => (
  <ConfirmationDialog
    trigger={trigger}
    title="Activate Item"
    description={`Are you sure you want to activate "${itemName}"?`}
    confirmText="Activate"
    onConfirm={onConfirm}
    icon={<Power className="w-5 h-5" />}
  />
);

export const DeactivateConfirmation: React.FC<{
  trigger: React.ReactNode;
  itemName: string;
  onConfirm: () => void;
}> = ({ trigger, itemName, onConfirm }) => (
  <ConfirmationDialog
    trigger={trigger}
    title="Deactivate Item"
    description={`Are you sure you want to deactivate "${itemName}"?`}
    confirmText="Deactivate"
    onConfirm={onConfirm}
    icon={<PowerOff className="w-5 h-5" />}
  />
);

export const SendEmailConfirmation: React.FC<{
  trigger: React.ReactNode;
  recipientCount: number;
  onConfirm: () => void;
}> = ({ trigger, recipientCount, onConfirm }) => (
  <ConfirmationDialog
    trigger={trigger}
    title="Send Email"
    description={`Are you sure you want to send email to ${recipientCount} recipients?`}
    confirmText="Send"
    onConfirm={onConfirm}
    icon={<Send className="w-5 h-5" />}
  />
);

export const PublishConfirmation: React.FC<{
  trigger: React.ReactNode;
  itemName: string;
  onConfirm: () => void;
}> = ({ trigger, itemName, onConfirm }) => (
  <ConfirmationDialog
    trigger={trigger}
    title="Publish Item"
    description={`Are you sure you want to publish "${itemName}"? It will be visible to all users.`}
    confirmText="Publish"
    onConfirm={onConfirm}
    icon={<Edit className="w-5 h-5" />}
  />
);
