import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Button } from '@/components/ui/button';
import { SnowBackground } from '@/components/SnowBackground';
import { Card } from '@/components/ui/card';

export const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(true);
  
  // Redirect to analyzer if already logged in
  useEffect(() => {
    if (user) {
      navigate('/analyzer');
    }
  }, [user, navigate]);

  return (
    <div className="relative min-h-screen">
      <SnowBackground />
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <h1 className="text-6xl font-bold text-white mb-6">
              WeatherWear
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-2xl">
              Your personal weather-based outfit analyzer. Get recommendations for what to wear based on real-time weather conditions and save your favorite outfits.
            </p>
            <Card className="w-full max-w-md p-6 bg-white/10 backdrop-blur-lg border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-6">
                {isSignIn ? 'Sign In to WeatherWear' : 'Create WeatherWear Account'}
              </h2>
              {isSignIn ? (
                <SignInForm
                  onSuccess={() => navigate('/analyzer')}
                  onSignUpClick={() => setIsSignIn(false)}
                />
              ) : (
                <SignUpForm
                  onSuccess={() => navigate('/analyzer')}
                  onSignInClick={() => setIsSignIn(true)}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 