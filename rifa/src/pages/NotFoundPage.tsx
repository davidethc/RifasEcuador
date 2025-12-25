import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PageContainer } from '@/shared/components/layout/PageContainer';

export function NotFoundPage() {
  return (
    <PageContainer>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-muted-foreground">404</CardTitle>
          <CardDescription className="text-xl mt-4">
            Página no encontrada
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/">
            <Button>
              Volver al inicio
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </PageContainer>
  );
}
