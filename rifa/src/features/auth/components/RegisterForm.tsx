import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useToast } from '@/shared/hooks/useToast';
import { cn } from '@/shared/lib/utils';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signUp, signInWithGoogle, error } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return 'El correo electrónico es requerido';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Correo electrónico inválido';
    }
    return undefined;
  };
  
  const validatePassword = (value: string) => {
    if (!value.trim()) {
      return 'La contraseña es requerida';
    }
    if (value.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return undefined;
  };
  
  const getPasswordStrength = (value: string): 'weak' | 'medium' | 'strong' => {
    if (value.length < 6) return 'weak';
    if (value.length < 10) return 'medium';
    if (/[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value)) {
      return 'strong';
    }
    return 'medium';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await signUp({ email, password, name });
      
      // Si el registro fue exitoso y hay sesión, redirigir al home
      if (response?.data?.user && response?.data?.session) {
        toast({
          variant: 'success',
          title: '¡Cuenta creada exitosamente!',
          description: 'Bienvenido a nuestra plataforma.',
        });
        // Usuario autenticado inmediatamente (puede pasar con OAuth o si el email ya estaba confirmado)
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else if (response?.data?.user) {
        toast({
          variant: 'default',
          title: 'Cuenta creada',
          description: 'Por favor, verifica tu correo electrónico para continuar.',
        });
        // Si no hay sesión, requiere confirmación de email
        // Redirigir a la página de verificación con el email
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      console.error('Register error:', err);
      // No navegar si hay error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
          <CardDescription className="text-center">
            Completa el formulario para crear tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm px-4 py-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre (opcional)</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className={name ? 'border-green-500/50' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  const error = validateEmail(value);
                  setErrors((prev) => ({ ...prev, email: error }));
                }}
                onBlur={() => {
                  const error = validateEmail(email);
                  setErrors((prev) => ({ ...prev, email: error }));
                }}
                required
                placeholder="tu@email.com"
                className={cn(
                  errors.email ? 'border-destructive focus-visible:ring-destructive' : email && !errors.email ? 'border-green-500/50' : ''
                )}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  const error = validatePassword(value);
                  setErrors((prev) => ({ ...prev, password: error }));
                }}
                onBlur={() => {
                  const error = validatePassword(password);
                  setErrors((prev) => ({ ...prev, password: error }));
                }}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className={cn(
                  errors.password ? 'border-destructive focus-visible:ring-destructive' : password && !errors.password ? 'border-green-500/50' : ''
                )}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.password}
                </p>
              )}
              {password && !errors.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn(
                      'h-1.5 flex-1 rounded-full',
                      getPasswordStrength(password) === 'weak' ? 'bg-destructive' :
                      getPasswordStrength(password) === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    )} />
                    <div className={cn(
                      'h-1.5 flex-1 rounded-full',
                      getPasswordStrength(password) === 'strong' ? 'bg-green-500' : 'bg-muted'
                    )} />
                    <div className={cn(
                      'h-1.5 flex-1 rounded-full',
                      getPasswordStrength(password) === 'strong' ? 'bg-green-500' : 'bg-muted'
                    )} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getPasswordStrength(password) === 'weak' && 'Contraseña débil'}
                    {getPasswordStrength(password) === 'medium' && 'Contraseña media'}
                    {getPasswordStrength(password) === 'strong' && 'Contraseña fuerte'}
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 hover:border-gray-300"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
