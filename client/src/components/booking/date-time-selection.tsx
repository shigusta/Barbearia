import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { format, addDays, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { BookingData } from "@/pages/booking";

interface TimeSlot {
  inicio: string;
  fim: string;
  display: string;
}

interface DateTimeSelectionProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function DateTimeSelection({ 
  bookingData, 
  updateBookingData, 
  nextStep,
  prevStep 
}: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(undefined);

  const { data: timeSlots, isLoading: isLoadingSlots, refetch } = useQuery<TimeSlot[]>({
    queryKey: [
      "/api/horarios-disponiveis",
      selectedDate?.toISOString().split('T')[0],
      bookingData.servico_id,
      bookingData.barbeiro_id
    ],
    enabled: !!(selectedDate && bookingData.servico_id),
    queryFn: async () => {
      if (!selectedDate || !bookingData.servico_id) return [];
      
      const params = new URLSearchParams({
        data: selectedDate.toISOString().split('T')[0],
        servico_id: bookingData.servico_id.toString(),
      });
      
      if (bookingData.barbeiro_id) {
        params.append('barbeiro_id', bookingData.barbeiro_id.toString());
      }

      const response = await fetch(`/api/horarios-disponiveis?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch time slots');
      }
      return response.json();
    }
  });

  useEffect(() => {
    if (selectedDate) {
      refetch();
      setSelectedTimeSlot(undefined);
    }
  }, [selectedDate, refetch]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(undefined);
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    updateBookingData({
      data_hora_inicio: new Date(timeSlot.inicio),
      data_hora_fim: new Date(timeSlot.fim),
    });
  };

  const handleContinue = () => {
    if (selectedTimeSlot && bookingData.data_hora_inicio) {
      nextStep();
    }
  };

  // Disable past dates and Sundays
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-display font-bold mb-6">Escolha Data e Horário</h3>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-elite-gold" />
            Selecione uma Data
          </h4>
          <Card className="elite-gray">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                locale={ptBR}
                fromDate={new Date()}
                toDate={addDays(new Date(), 30)}
                className="w-full"
              />
            </CardContent>
          </Card>
          {selectedDate && selectedDate.getDay() === 6 && (
            <p className="text-sm text-yellow-400 mt-2">
              ⚠️ Sábado: Funcionamento até 17:00
            </p>
          )}
        </div>

        {/* Time Slots */}
        <div>
          <h4 className="text-lg font-semibold mb-4">
            {selectedDate 
              ? `Horários - ${format(selectedDate, 'dd \'de\' MMMM', { locale: ptBR })}`
              : 'Selecione uma data primeiro'
            }
          </h4>
          
          {!selectedDate ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Escolha uma data para ver os horários disponíveis</p>
            </div>
          ) : isLoadingSlots ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-600 rounded animate-pulse"></div>
              ))}
            </div>
          ) : timeSlots && timeSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.inicio}
                  variant={selectedTimeSlot?.inicio === slot.inicio ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeSelect(slot)}
                  className={
                    selectedTimeSlot?.inicio === slot.inicio
                      ? "bg-elite-gold text-black hover:bg-yellow-500"
                      : "border-gray-600 text-gray-300 hover:bg-gray-600"
                  }
                >
                  {slot.display}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum horário disponível para esta data</p>
              <p className="text-sm mt-2">Tente selecionar outra data</p>
            </div>
          )}
        </div>
      </div>

      {selectedTimeSlot && (
        <Card className="elite-gray">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Resumo do Agendamento</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <p><strong>Data:</strong> {format(selectedDate!, 'dd/MM/yyyy')}</p>
              <p><strong>Horário:</strong> {selectedTimeSlot.display}</p>
              <p><strong>Duração:</strong> até {format(new Date(selectedTimeSlot.fim), 'HH:mm')}</p>
            </div>
          </CardContent>
        </Card>
      )}

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
          disabled={!selectedTimeSlot}
          className="bg-elite-gold hover:bg-yellow-500 text-black px-8 py-3 font-semibold transition-colors duration-300"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
