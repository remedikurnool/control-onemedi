import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

interface FormWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  showFooter?: boolean;
}

const FormWrapper: React.FC<FormWrapperProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitText = 'Save',
  cancelText = 'Cancel',
  isSubmitting = false,
  maxWidth = '2xl',
  showFooter = true
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2">
                  {description}
                </DialogDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Separator />

        <div className="py-4">
          {onSubmit ? (
            <form onSubmit={onSubmit} className="space-y-6">
              {children}
              
              {showFooter && (
                <>
                  <Separator />
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      {cancelText}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : submitText}
                    </Button>
                  </div>
                </>
              )}
            </form>
          ) : (
            <>
              {children}
              
              {showFooter && (
                <>
                  <Separator />
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      {cancelText}
                    </Button>
                    <Button disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : submitText}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormWrapper;