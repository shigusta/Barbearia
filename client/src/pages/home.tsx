import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ServiceCard from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Shield, Smartphone, Award, Users, Star } from "lucide-react";
import type { Servico } from "@shared/schema";

export default function Home() {
  const { data: servicos, isLoading } = useQuery<Servico[]>({
    queryKey: ["/api/servicos"],
  });

  const featuredServices = servicos?.slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 hero-bg"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight animate-fade-in-up">
            Tradição e Estilo<br />
            <span className="text-elite-gold">em Cada Corte</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in-up">
            Experimente o melhor da barbearia tradicional com o conforto e precisão dos tempos modernos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
            <Link href="/agendamento">
              <Button size="lg" className="bg-elite-gold hover:bg-yellow-500 text-black px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300">
                <Calendar className="mr-2 h-5 w-5" />
                Agende Seu Horário
              </Button>
            </Link>
            <Link href="/servicos">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                Ver Nossos Serviços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 elite-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Nossos <span className="text-elite-gold">Serviços</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Oferecemos uma gama completa de serviços para manter você sempre no seu melhor estilo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="elite-gray animate-pulse">
                  <CardContent className="p-8">
                    <div className="h-16 w-16 bg-gray-600 rounded-full mx-auto mb-6"></div>
                    <div className="h-6 bg-gray-600 rounded mb-4"></div>
                    <div className="h-20 bg-gray-600 rounded mb-6"></div>
                    <div className="h-10 bg-gray-600 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredServices.map((servico, index) => (
                <ServiceCard 
                  key={servico.id} 
                  servico={servico} 
                  featured={index === 2}
                />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link href="/servicos">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-elite-gold text-elite-gold hover:bg-elite-gold hover:text-black px-8 py-3 font-semibold transition-all duration-300"
              >
                Ver Todos os Serviços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Booking System Features */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Agendamento <span className="text-elite-gold">Online</span>
            </h2>
            <p className="text-xl text-gray-300">
              Reserve seu horário em poucos cliques. Sistema inteligente que mostra apenas horários disponíveis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-elite-gold text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold mb-4">Horários Reais</h4>
              <p className="text-gray-400">Veja apenas horários realmente disponíveis</p>
            </div>
            <div className="text-center">
              <div className="bg-elite-gold text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold mb-4">Confirmação Instantânea</h4>
              <p className="text-gray-400">Receba confirmação por SMS e email</p>
            </div>
            <div className="text-center">
              <div className="bg-elite-gold text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold mb-4">Mobile Friendly</h4>
              <p className="text-gray-400">Agende facilmente pelo seu celular</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/agendamento">
              <Button size="lg" className="bg-elite-gold hover:bg-yellow-500 text-black px-8 py-4 text-lg font-semibold">
                Começar Agendamento
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 elite-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Sobre a <span className="text-elite-gold">Lublack Hair</span>
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Desde 2010, combinamos a tradição da barbearia clássica com técnicas modernas e produtos de alta qualidade. Nossa missão é proporcionar uma experiência única, onde cada cliente sai renovado e confiante.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Award className="text-elite-gold text-xl mr-4 h-6 w-6" />
                  <span>Mais de 13 anos de experiência</span>
                </div>
                <div className="flex items-center">
                  <Users className="text-elite-gold text-xl mr-4 h-6 w-6" />
                  <span>Mais de 5.000 clientes satisfeitos</span>
                </div>
                <div className="flex items-center">
                  <Star className="text-elite-gold text-xl mr-4 h-6 w-6" />
                  <span>Avaliação 4.9/5 no Google</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Professional barber working in modern barbershop" 
                className="rounded-2xl shadow-2xl w-full h-auto" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              O que Nossos <span className="text-elite-gold">Clientes Dizem</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Silva",
                role: "Cliente há 3 anos",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80",
                testimonial: "Excelente atendimento e qualidade impecável. O sistema de agendamento online é muito prático, nunca mais perdi tempo esperando. Recomendo!"
              },
              {
                name: "Ricardo Santos",
                role: "Cliente há 2 anos",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80",
                testimonial: "Ambiente profissional, barbeiros experientes e produtos de qualidade. O combo completo vale muito a pena. Sempre saio renovado!"
              },
              {
                name: "João Oliveira",
                role: "Cliente há 1 ano",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80",
                testimonial: "Pontualidade, qualidade e preço justo. O agendamento online funciona perfeitamente e nunca tive problemas. Lugar de confiança!"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="elite-dark">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="flex text-elite-gold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 italic">
                    "{testimonial.testimonial}"
                  </p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4" 
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
