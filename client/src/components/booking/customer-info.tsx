import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, User, Mail, Phone } from "lucide-react";
import { validateEmail, validatePhone, formatPhone } from "@/lib/utils";
import type { BookingData } from "@/pages/booking";

interface CustomerInfoProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function CustomerInfo({ 
  bookingData, 
  updateBookingData, 
  nextStep,
  prevStep 
}: CustomerInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof BookingData, value: string) => {
    updateBookingData({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleInputChange('telefone_cliente', formatted);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!bookingData.nome_cliente?.trim()) {
      newErrors.nome_cliente = 'Nome é obrigatório';
    } else if (bookingData.nome_cliente.trim().length < 2) {
      newErrors.nome_cliente = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!bookingData.telefone_cliente?.trim()) {
      newErrors.telefone_cliente = 'Telefone é obrigatório';
    } else if (!validatePhone(bookingData.telefone_cliente)) {
      newErrors.telefone_cliente = 'Telefone inválido';
    }

    if (!bookingData.email_cliente?.trim()) {
      newErrors.email_cliente = 'Email é obrigatório';
    } else if (!validateEmail(bookingData.email_cliente)) {
      newErrors.email_cliente = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-display font-bold mb-6">Seus Dados</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="nome" className="flex items-center mb-2">
            <User className="mr-2 h-4 w-4 text-elite-gold" />
            Nome Completo *
          </Label>
          <Input
            id="nome"
            type="text"
            value={bookingData.nome_cliente || ''}
            onChange={(e) => handleInputChange('nome_cliente', e.target.value)}
            placeholder="Digite seu nome completo"
            className={`bg-black border-gray-600 text-white focus:border-elite-gold ${
              errors.nome_cliente ? 'border-red-500' : ''
            }`}
          />
          {errors.nome_cliente && (
            <p className="text-red-400 text-sm mt-1">{errors.nome_cliente}</p>
          )}
        </div>

        <div>
          <Label htmlFor="telefone" className="flex items-center mb-2">
            <Phone className="mr-2 h-4 w-4 text-elite-gold" />
            Telefone (WhatsApp) *
          </Label>
          <Input
            id="telefone"
            type="tel"
            value={bookingData.telefone_cliente || ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(11) 99999-9999"
            className={`bg-black border-gray-600 text-white focus:border-elite-gold ${
              errors.telefone_cliente ? 'border-red-500' : ''
            }`}
          />
          {errors.telefone_cliente && (
            <p className="text-red-400 text-sm mt-1">{errors.telefone_cliente}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Usaremos o WhatsApp para confirmar seu agendamento
          </p>
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center mb-2">
            <Mail className="mr-2 h-4 w-4 text-elite-gold" />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={bookingData.email_cliente || ''}
            onChange={(e) => handleInputChange('email_cliente', e.target.value)}
            placeholder="seu@email.com"
            className={`bg-black border-gray-600 text-white focus:border-elite-gold ${
              errors.email_cliente ? 'border-red-500' : ''
            }`}
          />
          {errors.email_cliente && (
            <p className="text-red-400 text-sm mt-1">{errors.email_cliente}</p>
          )}
        </div>

        <div>
          <Label htmlFor="observacoes" className="mb-2 block">
            Observações (Opcional)
          </Label>
          <Textarea
            id="observacoes"
            value={bookingData.observacoes || ''}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            placeholder="Alguma observação especial? Ex: preferência de corte, alergias, etc."
            className="bg-black border-gray-600 text-white focus:border-elite-gold resize-none"
            rows={3}
          />
        </div>
      </div>

      <div className="bg-elite-gray p-4 rounded-lg">
        <h4 className="font-semibold mb-2 text-elite-gold">Política de Privacidade</h4>
        <p className="text-sm text-gray-300">
          Seus dados pessoais serão utilizados apenas para o agendamento e comunicação sobre os serviços. 
          Não compartilhamos suas informações com terceiros.
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          onClick={prevStep}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={handleContinue}
          className="bg-elite-gold hover:bg-yellow-500 text-black px-8 py-3 font-semibold transition-colors duration-300"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
