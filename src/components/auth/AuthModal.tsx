import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isSignIn, setIsSignIn] = useState(true);

  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isSignIn ? 'Sign In to WeatherWear' : 'Create WeatherWear Account'}
          </DialogTitle>
        </DialogHeader>
        {isSignIn ? (
          <SignInForm
            onSuccess={handleSuccess}
            onSignUpClick={() => setIsSignIn(false)}
          />
        ) : (
          <SignUpForm
            onSuccess={handleSuccess}
            onSignInClick={() => setIsSignIn(true)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}; 