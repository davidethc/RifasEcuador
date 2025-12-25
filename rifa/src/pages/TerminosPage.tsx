import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export function TerminosPage() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Título mejorado */}
        <div className="text-center space-y-3 fade-in-up">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">
            Términos y condiciones
          </h1>
          <p className="text-lg text-muted-foreground">
            Información importante sobre nuestros sorteos
          </p>
        </div>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg fade-in-up">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-foreground text-center">
              Condiciones de participación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 text-foreground">
            <section className="space-y-3 pb-6 border-b border-border/30 last:border-0">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mt-1">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-xl font-bold text-foreground">Aceptación de términos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Al participar en nuestros sorteos, aceptas estos términos y condiciones 
                    en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, 
                    no debes participar en los sorteos.
                  </p>
                </div>
              </div>
            </section>

            {[
              { num: 2, title: 'Elegibilidad', text: 'Para participar en nuestros sorteos, debes ser mayor de edad según la legislación de tu país. Los sorteos están sujetos a las leyes y regulaciones locales aplicables.' },
              { num: 3, title: 'Compra de boletos', text: 'Los boletos se asignan de forma aleatoria y automática. Una vez completada la compra, no se permiten cambios, devoluciones ni cancelaciones, excepto en casos excepcionales contemplados por la ley.' },
              { num: 4, title: 'Realización del sorteo', text: 'Los sorteos se realizarán en las fechas programadas y serán supervisados por un notario público o autoridad competente. Los resultados serán publicados en nuestra plataforma y serán definitivos.' },
              { num: 5, title: 'Premios', text: 'Los premios se entregarán a los ganadores según se establezca en cada sorteo. Los ganadores serán contactados a través de los datos proporcionados durante la compra. Es responsabilidad del participante mantener sus datos actualizados.' },
              { num: 6, title: 'Privacidad', text: 'Respetamos tu privacidad y protegemos tus datos personales de acuerdo con nuestra política de privacidad. Tus datos solo se utilizarán para los fines relacionados con la participación en los sorteos.' },
              { num: 7, title: 'Limitación de responsabilidad', text: 'No nos hacemos responsables por pérdidas o daños derivados de la participación en los sorteos, excepto en los casos previstos por la ley.' },
              { num: 8, title: 'Modificaciones', text: 'Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones serán publicadas en esta página y entrarán en vigor inmediatamente.' },
            ].map((section) => (
              <section key={section.num} className="space-y-3 pb-6 border-b border-border/30 last:border-0">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mt-1">
                    <span className="text-sm font-bold text-primary">{section.num}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.text}
                    </p>
                  </div>
                </div>
              </section>
            ))}

            <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-primary/3 rounded-xl border border-primary/20">
              <p className="text-sm text-foreground text-center">
                <strong className="text-primary font-bold">Última actualización:</strong>{' '}
                {new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
