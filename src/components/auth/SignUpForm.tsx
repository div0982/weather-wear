import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FirebaseError } from 'firebase/app';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSignInClick: () => void;
}

export const SignUpForm = ({ onSuccess, onSignInClick }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Starting sign up process...'); // Debug log

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to create account with email:', email); // Debug log
      const result = await signUp(email, password);
      console.log('Sign up successful:', result); // Debug log
      toast.success('Account created successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Detailed sign up error:', {
        error,
        code: error instanceof FirebaseError ? error.code : 'unknown',
        message: error instanceof Error ? error.message : 'unknown',
        fullError: JSON.stringify(error, null, 2)
      });

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            toast.error('This email is already registered');
            break;
          case 'auth/invalid-email':
            toast.error('Invalid email address');
            break;
          case 'auth/operation-not-allowed':
            toast.error('Email/password sign up is not enabled');
            break;
          case 'auth/weak-password':
            toast.error('Password is too weak');
            break;
          default:
            toast.error(`Error: ${error.code} - ${error.message}`);
        }
      } else {
        toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onSignInClick}
          disabled={loading}
        >
          Already have an account? Sign In
        </Button>
      </div>
    </form>
  );
}; 