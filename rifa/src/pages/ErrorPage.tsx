import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PageContainer } from '@/shared/components/layout/PageContainer';

export function ErrorPage() {
  const error = useRouteError();

  let errorMessage = 'Ocurrió un error inesperado';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <CardTitle className="text-6xl font-bold text-destructive">
              {errorStatus}
            </CardTitle>
            <CardDescription className="text-xl mt-4">
              {errorStatus === 404 ? 'Página no encontrada' : 'Algo salió mal'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-lg">
              {errorStatus === 404
                ? 'La página que buscas no existe o ha sido movida.'
                : errorMessage}
            </p>
            {errorStatus === 404 && (
              <p className="text-sm text-muted-foreground">
                Puede que hayas escrito mal la dirección o la página haya sido eliminada.
              </p>
            )}
            {import.meta.env.DEV && error instanceof Error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
                  Detalles técnicos (solo en desarrollo)
                </summary>
                <pre className="text-xs text-muted-foreground bg-muted p-4 rounded-md text-left overflow-auto max-h-60">
                  {error.stack}
                </pre>
              </details>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                Volver al inicio
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto"
            >
              Recargar página
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
