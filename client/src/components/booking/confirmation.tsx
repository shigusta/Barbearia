import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle,
  Calendar,
  Clock,
  User,
  Scissors,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { BookingData } from "@/pages/booking";
import type { Servico, Barbeiro } from "@shared/schema";

interface ConfirmationProps {
  bookingData: BookingData;
  prevStep: () => void;
  resetBooking?: () => void; // Adicionada a nova prop opcional
}

export default function Confirmation({
  bookingData,
  prevStep,
  resetBooking,
}: ConfirmationProps) {
  const [isBooked, setIsBooked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: servicos } = useQuery<Servico[]>({
    queryKey: ["/api/servicos"],
  });

  const { data: barbeiros } = useQuery<Barbeiro[]>({
    queryKey: ["/api/barbeiros"],
  });

  const selectedService = servicos?.find(
    (s) => s.id === bookingData.servico_id
  );
  const selectedBarber = barbeiros?.find(
    (b) => b.id === bookingData.barbeiro_id
  );

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingData) => {
      return await apiRequest("POST", "/api/agendar", {
        nome_cliente: data.nome_cliente,
        telefone_cliente: data.telefone_cliente,
        email_cliente: data.email_cliente,
        servico_id: data.servico_id,
        barbeiro_id: data.barbeiro_id || barbeiros?.[0]?.id, // Default to first barber if none selected
        data_hora_inicio: data.data_hora_inicio?.toISOString(),
        data_hora_fim: data.data_hora_fim?.toISOString(),
        observacoes: data.observacoes || "",
        status: "confirmado",
      });
    },
    onSuccess: async (response) => {
      const result = await response.json();
      setIsBooked(true);
      toast({
        title: "Agendamento Confirmado!",
        description: result.message,
        duration: 5000,
      });
      // Invalidate appointments cache
      queryClient.invalidateQueries({ queryKey: ["/api/agendamentos"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Agendamento",
        description:
          error.message ||
          "Não foi possível realizar o agendamento. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleConfirmBooking = () => {
    if (!bookingData.data_hora_inicio || !bookingData.data_hora_fim) {
      toast({
        title: "Dados Incompletos",
        description:
          "Por favor, volte e complete todos os dados do agendamento.",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate(bookingData);
  };

  if (isBooked) {
    return (
      <div className="text-center space-y-6">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h3 className="text-3xl font-display font-bold text-green-500">
          Agendamento Confirmado!
        </h3>
        <p className="text-lg text-gray-300">
          Seu agendamento foi realizado com sucesso. Você receberá uma
          confirmação por WhatsApp e email.
        </p>

        <Card className="elite-gray max-w-md mx-auto">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 text-elite-gold">
              Detalhes do Agendamento
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Serviço:</span>
                <span>{selectedService?.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Barbeiro:</span>
                <span>{selectedBarber?.nome || "Qualquer barbeiro"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data/Hora:</span>
                <span>
                  {bookingData.data_hora_inicio &&
                    formatDateTime(bookingData.data_hora_inicio)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cliente:</span>
                <span>{bookingData.nome_cliente}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <p className="text-gray-400">
            📱 Salve nosso contato: <strong>(11) 99999-9999</strong>
          </p>
          <p className="text-gray-400">
            📍 Endereço: Rua das Palmeiras, 123 - Centro, São Paulo
          </p>
        </div>

        <Button
          onClick={resetBooking}
          className="bg-elite-gold hover:bg-yellow-500 text-black px-8 py-3 font-semibold"
        >
          Fazer Novo Agendamento
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-display font-bold mb-6">
        Confirmação do Agendamento
      </h3>

      <div className="space-y-4">
        <Card className="elite-gray">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-4 text-elite-gold flex items-center">
              <Scissors className="mr-2 h-5 w-5" />
              Resumo do Serviço
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Serviço:</span>
                <span className="font-semibold">{selectedService?.nome}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Duração:</span>
                <span>
                  {selectedService &&
                    formatDuration(selectedService.duracao_minutos)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Barbeiro:</span>
                <span>
                  {selectedBarber?.nome || "Qualquer barbeiro disponível"}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-400">Valor:</span>
                <span className="font-bold text-elite-gold">
                  {selectedService && formatCurrency(selectedService.preco)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="elite-gray">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-4 text-elite-gold flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Data e Horário
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Data:</span>
                <span className="font-semibold">
                  {bookingData.data_hora_inicio &&
                    formatDateTime(bookingData.data_hora_inicio).split(" ")[0]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Horário de início:</span>
                <span className="font-semibold">
                  {bookingData.data_hora_inicio &&
                    formatDateTime(bookingData.data_hora_inicio).split(" ")[1]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Previsão de término:</span>
                <span>
                  {bookingData.data_hora_fim &&
                    formatDateTime(bookingData.data_hora_fim).split(" ")[1]}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="elite-gray">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-4 text-elite-gold flex items-center">
              <User className="mr-2 h-5 w-5" />
              Seus Dados
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Nome:</span>
                <span className="font-semibold">
                  {bookingData.nome_cliente}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Telefone:</span>
                <span>{bookingData.telefone_cliente}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Email:</span>
                <span>{bookingData.email_cliente}</span>
              </div>
              {bookingData.observacoes && (
                <div>
                  <span className="text-gray-400 block mb-1">Observações:</span>
                  <span className="text-sm">{bookingData.observacoes}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-elite-gold bg-elite-gold/10">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-4 text-elite-gold flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Local do Atendimento
            </h4>
            <div className="space-y-2">
              <p className="font-semibold">Elite Barber Shop</p>
              <p className="text-gray-300">Rua das Palmeiras, 123</p>
              <p className="text-gray-300">Centro, São Paulo - SP</p>
              <p className="text-gray-300">CEP: 01234-567</p>
              <p className="text-sm text-gray-400 mt-3">
                📞 (11) 99999-9999 | WhatsApp disponível
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
        <h5 className="font-semibold text-yellow-400 mb-2">Importante:</h5>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Chegue com 5 minutos de antecedência</li>
          <li>
            • Em caso de atraso superior a 15 minutos, o horário poderá ser
            reagendado
          </li>
          <li>
            • Para cancelamentos, entre em contato com até 2 horas de
            antecedência
          </li>
          <li>• Aceitamos dinheiro, PIX e cartão</li>
        </ul>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          onClick={prevStep}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-600"
          disabled={bookingMutation.isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={handleConfirmBooking}
          disabled={bookingMutation.isPending}
          className="bg-elite-gold hover:bg-yellow-500 text-black px-8 py-3 font-semibold transition-colors duration-300"
        >
          {bookingMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              Confirmando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirmar Agendamento
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
