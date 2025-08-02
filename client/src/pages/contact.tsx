import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  Instagram, 
  Facebook, 
  MessageCircle,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { validateEmail } from "@/lib/utils";

interface ContactFormData {
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    nome: '',
    email: '',
    telefone: '',
    assunto: 'Informações gerais',
    mensagem: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return await apiRequest('POST', '/api/contato', data);
    },
    onSuccess: async (response) => {
      const result = await response.json();
      toast({
        title: "Mensagem Enviada!",
        description: result.message,
        duration: 5000,
      });
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: 'Informações gerais',
        mensagem: ''
      });
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao Enviar",
        description: error.message || "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.assunto.trim()) {
      newErrors.assunto = 'Assunto é obrigatório';
    }

    if (!formData.mensagem.trim()) {
      newErrors.mensagem = 'Mensagem é obrigatória';
    } else if (formData.mensagem.trim().length < 10) {
      newErrors.mensagem = 'Mensagem deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      contactMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Entre em <span className="text-elite-gold">Contato</span>
              </h1>
              <p className="text-xl text-gray-300">
                Estamos prontos para atendê-lo. Venha nos visitar ou entre em contato.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-20 elite-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-display font-bold mb-6">Informações de Contato</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-elite-gold text-black w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Endereço</h4>
                      <p className="text-gray-300">
                        Rua Pará - Planaltina-Df<br />
                        St. Tradicional<br />
                        CEP: 01234-567
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-elite-gold text-black w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Telefone</h4>
                      <p className="text-gray-300">(61) 98552-6715</p>
                      <p className="text-sm text-gray-400">WhatsApp disponível</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-elite-gold text-black w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Horário de Funcionamento</h4>
                      <div className="text-gray-300 space-y-1">
                        <p>Segunda a Sexta: 09:00 - 19:00</p>
                        <p>Sábado: 08:00 - 17:00</p>
                        <p>Domingo: Fechado</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-elite-gold text-black w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email</h4>
                      <p className="text-gray-300">contato@elitebarber.com</p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="pt-6">
                  <h4 className="font-semibold mb-4">Siga-nos nas redes sociais</h4>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="bg-elite-gray hover:bg-elite-gold text-white hover:text-black w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                    <a
                      href="#"
                      className="bg-elite-gray hover:bg-elite-gold text-white hover:text-black w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                    >
                      <Facebook className="h-6 w-6" />
                    </a>
                    <a
                      href="https://wa.me/5511985526715"
                      className="bg-elite-gray hover:bg-elite-gold text-white hover:text-black w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                    >
                      <MessageCircle className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <Card className="elite-gray">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-display font-bold mb-6">Envie uma Mensagem</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome" className="mb-2 block">Nome *</Label>
                        <Input
                          id="nome"
                          type="text"
                          value={formData.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          placeholder="Seu nome completo"
                          className={`bg-black border-gray-600 text-white focus:border-elite-gold ${
                            errors.nome ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {errors.nome && (
                          <p className="text-red-400 text-sm mt-1">{errors.nome}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="telefone" className="mb-2 block">Telefone</Label>
                        <Input
                          id="telefone"
                          type="tel"
                          value={formData.telefone}
                          onChange={(e) => handleInputChange('telefone', e.target.value)}
                          placeholder="(61) 985526715"
                          className="bg-black border-gray-600 text-white focus:border-elite-gold"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="mb-2 block">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        className={`bg-black border-gray-600 text-white focus:border-elite-gold ${
                          errors.email ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="assunto" className="mb-2 block">Assunto</Label>
                      <select
                        id="assunto"
                        value={formData.assunto}
                        onChange={(e) => handleInputChange('assunto', e.target.value)}
                        className={`w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-elite-gold focus:outline-none transition-colors duration-300 ${
                          errors.assunto ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="Informações gerais">Informações gerais</option>
                        <option value="Agendamento">Agendamento</option>
                        <option value="Reclamação">Reclamação</option>
                        <option value="Sugestão">Sugestão</option>
                      </select>
                      {errors.assunto && (
                        <p className="text-red-400 text-sm mt-1">{errors.assunto}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="mensagem" className="mb-2 block">Mensagem *</Label>
                      <Textarea
                        id="mensagem"
                        rows={4}
                        value={formData.mensagem}
                        onChange={(e) => handleInputChange('mensagem', e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className={`bg-black border-gray-600 text-white focus:border-elite-gold resize-none ${
                          errors.mensagem ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {errors.mensagem && (
                        <p className="text-red-400 text-sm mt-1">{errors.mensagem}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={contactMutation.isPending}
                      className="w-full bg-elite-gold hover:bg-yellow-500 text-black py-3 font-semibold transition-colors duration-300"
                    >
                      {contactMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Nossa <span className="text-elite-gold">Localização</span>
              </h2>
              <p className="text-gray-300">
                Venha nos visitar! Estamos localizados no coração de Planaltina-Df.
              </p>
            </div>
            
            <Card className="elite-gray">
              <CardContent className="p-0">
                <div className="aspect-video w-full rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975!2d-46.6311!3d-23.5505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzAxLjgiUyA0NsKwMzcnNTIuMCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lublack Hair - Localização"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
