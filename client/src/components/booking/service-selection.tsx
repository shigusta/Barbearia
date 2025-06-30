import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { Servico } from "@shared/schema";
import type { BookingData } from "@/pages/booking";

interface ServiceSelectionProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  nextStep: () => void;
}

export default function ServiceSelection({ 
  bookingData, 
  updateBookingData, 
  nextStep 
}: ServiceSelectionProps) {
  const { data: servicos, isLoading } = useQuery<Servico[]>({
    queryKey: ["/api/servicos"],
  });

  const selectedService = servicos?.find(s => s.id === bookingData.servico_id);

  const handleServiceSelect = (servico: Servico) => {
    updateBookingData({ servico_id: servico.id });
  };

  const handleContinue = () => {
    if (bookingData.servico_id) {
      nextStep();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-display font-bold mb-6">Escolha seu Serviço</h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="elite-gray animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-gray-600 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-display font-bold mb-6">Escolha seu Serviço</h3>
      
      <div className="space-y-3">
        {servicos?.map((servico) => (
          <Card
            key={servico.id}
            className={`cursor-pointer transition-all duration-300 ${
              bookingData.servico_id === servico.id
                ? 'border-2 border-elite-gold bg-elite-gold/10'
                : 'border-2 border-gray-600 hover:border-gray-500 elite-gray'
            }`}
            onClick={() => handleServiceSelect(servico)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${
                      bookingData.servico_id === servico.id ? 'text-elite-gold' : ''
                    }`}>
                      {servico.nome}
                    </h4>
                    {servico.nome.toLowerCase().includes('combo') && (
                      <Badge className="bg-elite-red text-white text-xs">
                        Mais Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {servico.descricao} ({formatDuration(servico.duracao_minutos)})
                  </p>
                </div>
                <span className={`text-lg font-bold ${
                  bookingData.servico_id === servico.id ? 'text-elite-gold' : ''
                }`}>
                  {formatCurrency(servico.preco)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedService && (
        <Card className="elite-gray mt-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Tempo total estimado:</span>
              <span className="font-bold text-elite-gold">
                {formatDuration(selectedService.duracao_minutos)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-300">Valor total:</span>
              <span className="font-bold text-elite-gold text-xl">
                {formatCurrency(selectedService.preco)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end mt-8">
        <Button
          onClick={handleContinue}
          disabled={!bookingData.servico_id}
          className="bg-elite-gold hover:bg-yellow-500 text-black px-8 py-3 font-semibold transition-colors duration-300"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
