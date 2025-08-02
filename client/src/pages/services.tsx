import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ServiceCard from "@/components/service-card";
import { Card, CardContent } from "@/components/ui/card";
import type { Servico } from "@shared/schema";

export default function Services() {
  const { data: servicos, isLoading } = useQuery<Servico[]>({
    queryKey: ["/api/servicos"],
  });

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
                Nossos <span className="text-elite-gold">Serviços</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Descubra todos os nossos serviços profissionais. Cada atendimento é personalizado para realçar seu estilo único.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 elite-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="elite-gray animate-pulse">
                    <CardContent className="p-8">
                      <div className="h-16 w-16 bg-gray-600 rounded-full mx-auto mb-6"></div>
                      <div className="h-6 bg-gray-600 rounded mb-4"></div>
                      <div className="h-20 bg-gray-600 rounded mb-6"></div>
                      <div className="h-10 bg-gray-600 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : servicos && servicos.length > 0 ? (
                servicos.map((servico, index) => (
                  <ServiceCard 
                    key={servico.id} 
                    servico={servico}
                    featured={servico.nome.toLowerCase().includes('combo')}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-xl text-gray-400">Nenhum serviço disponível no momento.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-display font-bold mb-6 text-elite-gold">
                  Por que Escolher a Lublack Hair?
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>✓ Profissionais experientes e qualificados</p>
                  <p>✓ Produtos premium de alta qualidade</p>
                  <p>✓ Ambiente limpo e moderno</p>
                  <p>✓ Atendimento personalizado</p>
                  <p>✓ Agendamento online prático</p>
                  <p>✓ Preços justos e transparentes</p>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold mb-6 text-elite-gold">
                  Dicas de Cuidados
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>• Mantenha um corte regular a cada 3-4 semanas</p>
                  <p>• Use produtos adequados ao seu tipo de cabelo</p>
                  <p>• Hidrate a barba diariamente com óleos específicos</p>
                  <p>• Proteja o cabelo do sol e poluição</p>
                  <p>• Mantenha uma alimentação saudável</p>
                  <p>• Beba bastante água para cabelos saudáveis</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
