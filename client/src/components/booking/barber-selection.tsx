import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, User } from "lucide-react";
import type { Barbeiro } from "@shared/schema";
import type { BookingData } from "@/pages/booking";

interface BarberSelectionProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function BarberSelection({
  bookingData,
  updateBookingData,
  nextStep,
  prevStep,
}: BarberSelectionProps) {
  const { data: barbeiros, isLoading } = useQuery<Barbeiro[]>({
    queryKey: ["/api/barbeiros"],
  });

  const handleBarberSelect = (barbeiro: Barbeiro | null) => {
    updateBookingData({ barbeiro_id: barbeiro?.id });
  };

  const handleContinue = () => {
    if (bookingData.barbeiro_id === null) {
      return; // Prevent proceeding if no barber is selected
    }
    nextStep();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-display font-bold mb-6">
          Escolha seu Barbeiro
        </h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="elite-gray animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-600 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-display font-bold mb-6">
        Escolha seu Barbeiro
      </h3>

      <div className="space-y-3">
        {/* Option: Any barber */}
        <Card
          className={`cursor-pointer transition-all duration-300 ${
            bookingData.barbeiro_id === undefined
              ? "border-2 border-elite-gold bg-elite-gold/10"
              : "border-2 border-gray-600 hover:border-gray-500 elite-gray"
          }`}
          onClick={() => handleBarberSelect(null)}
        >
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-elite-gold text-black w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h4
                  className={`font-semibold ${
                    bookingData.barbeiro_id === undefined
                      ? "text-elite-gold"
                      : ""
                  }`}
                >
                  Qualquer Barbeiro
                </h4>
                <p className="text-sm text-gray-400">
                  Deixe nosso sistema escolher o melhor horário disponível
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specific barbers */}
        {barbeiros?.map((barbeiro) => (
          <Card
            key={barbeiro.id}
            className={`cursor-pointer transition-all duration-300 ${
              bookingData.barbeiro_id === barbeiro.id
                ? "border-2 border-elite-gold bg-elite-gold/10"
                : "border-2 border-gray-600 hover:border-gray-500 elite-gray"
            }`}
            onClick={() => handleBarberSelect(barbeiro)}
          >
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-gray-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  {barbeiro.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      bookingData.barbeiro_id === barbeiro.id
                        ? "text-elite-gold"
                        : ""
                    }`}
                  >
                    {barbeiro.nome}
                  </h4>
                  <p className="text-sm text-gray-400">
                    Barbeiro profissional especializado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
          disabled={bookingData.barbeiro_id === null}
          className="bg-elite-gold hover:bg-yellow-500 text-black px-8 py-3 font-semibold transition-colors duration-300"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
