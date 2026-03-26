import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HardHat, LogIn } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  userEmail: string;
  onLogin: (email: string) => void;
  onLogout: () => void;
}

export function Header({ isLoggedIn, userEmail, onLogin, onLogout }: HeaderProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
    setOpen(false);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setTitle('');
    setPhone('');
  };

  return (
    <header className="bg-zinc-900 border-b-4 border-amber-500 sticky top-0 z-[1000]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-lg">
            <HardHat className="w-6 h-6 text-zinc-900" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">
              TRADE PARTNER <span className="text-amber-500">HQ</span>
            </h1>
            <p className="text-[11px] text-zinc-400 tracking-widest uppercase">
              Where Trade Partners and General Contractors Connect!
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          <Link to="/events" className="hover:text-amber-500 transition-colors">Events</Link>
          <Link to="/awards" className="hover:text-amber-500 transition-colors">Awards</Link>
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-300 hidden sm:inline">{userEmail}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              >
                Log out
              </Button>
            </div>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold"
                  size="sm"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Free Account'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {authMode === 'signup' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="First"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Last"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="company">Company Name</Label>
                        <Input id="company" placeholder="Your trade or business name" />
                      </div>
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g. Project Manager, Estimator"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 555-1234"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold"
                  >
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>
                  <p className="text-sm text-center text-zinc-500">
                    {authMode === 'login' ? (
                      <>
                        No account?{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('signup')}
                          className="text-amber-600 font-semibold hover:underline"
                        >
                          Sign up free
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className="text-amber-600 font-semibold hover:underline"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}
