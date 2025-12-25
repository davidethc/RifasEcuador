import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <Card className="group bg-card/95 backdrop-blur-sm border-border/50 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-500 h-full overflow-hidden relative">
      {/* Efecto de brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0 relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300">
              <span className="text-2xl font-extrabold text-primary">{number}</span>
            </div>
            {/* Línea decorativa */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary/30 rounded-full group-hover:w-12 group-hover:bg-primary/50 transition-all duration-300" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground leading-tight pt-2 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 relative z-10">
        <p className="text-muted-foreground leading-relaxed text-[15px]">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

const steps = [
  {
    number: 1,
    title: 'Explora los sorteos',
    description: 'Navega por nuestra página principal y descubre los sorteos disponibles. Cada sorteo muestra información detallada sobre los premios, fechas y disponibilidad de boletos.',
  },
  {
    number: 2,
    title: 'Selecciona tu sorteo',
    description: 'Haz clic en "Participar ahora" en el sorteo que más te interese. Podrás ver todos los detalles, incluyendo los premios disponibles y el progreso del sorteo.',
  },
  {
    number: 3,
    title: 'Elige tus boletos',
    description: 'Selecciona la cantidad de boletos que deseas comprar. Los números se asignarán automáticamente de forma aleatoria para garantizar la transparencia del sorteo.',
  },
  {
    number: 4,
    title: 'Completa tus datos',
    description: 'Ingresa tu información personal necesaria para procesar tu compra. Puedes participar como invitado o crear una cuenta para un proceso más rápido en futuras compras.',
  },
  {
    number: 5,
    title: 'Realiza el pago',
    description: 'Completa el proceso de pago de forma segura. Una vez confirmado, recibirás tus boletos asignados y podrás verlos en la sección "Mis Boletos".',
  },
  {
    number: 6,
    title: '¡Espera el sorteo!',
    description: 'Mantente atento a la fecha del sorteo. Los resultados se publicarán en nuestra plataforma y te notificaremos si eres ganador.',
  },
];

export function ComoJugarPage() {
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Título principal mejorado */}
        <div className="text-center space-y-4 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-2">
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-semibold text-primary">Guía rápida</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">
            Cómo jugar
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Sigue estos simples pasos para participar en nuestros sorteos
          </p>
        </div>

        {/* Grid de cards con pasos mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <StepCard
                number={step.number}
                title={step.title}
                description={step.description}
              />
            </div>
          ))}
        </div>

        {/* Card de ayuda mejorada */}
        <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-primary/20 shadow-sm fade-in-up">
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-foreground text-lg">
                <strong className="text-primary font-bold">¿Tienes preguntas?</strong>
              </p>
              <p className="text-muted-foreground">
                Contáctanos a través de WhatsApp o por correo electrónico. Estamos aquí para ayudarte.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
