import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ServiceSelection from "@/components/booking/service-selection";
import BarberSelection from "@/components/booking/barber-selection";
import DateTimeSelection from "@/components/booking/date-time-selection";
import CustomerInfo from "@/components/booking/customer-info";
import Confirmation from "@/components/booking/confirmation";

export interface BookingData {
  servico_id?: number;
  barbeiro_id?: number;
  data_hora_inicio?: Date;
  data_hora_fim?: Date;
  nome_cliente?: string;
  telefone_cliente?: string;
  email_cliente?: string;
  observacoes?: string;
}

export default function Booking() {
  const [location] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});

  // Efeito para ler o serviço da URL (continua o mesmo)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split("?")[1] || "");
    const servicoId = urlParams.get("servico");
    if (servicoId) {
      setBookingData((prev) => ({ ...prev, servico_id: parseInt(servicoId) }));
    }
  }, [location]);

  const steps = [
    { number: 1, title: "Serviço", component: ServiceSelection },
    { number: 2, title: "Barbeiro", component: BarberSelection },
    { number: 3, title: "Data & Hora", component: DateTimeSelection },
    { number: 4, title: "Seus Dados", component: CustomerInfo },
    { number: 5, title: "Confirmação", component: Confirmation },
  ];

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // FUNÇÃO DE RESET ADICIONADA AQUI
  const resetBooking = () => {
    setBookingData({});
    setCurrentStep(1);
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <section className="py-20 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* ... (seu JSX para o título e o indicador de passos continua o mesmo) ... */}

            <div className="elite-dark rounded-2xl p-8 shadow-2xl">
              {/* Step Indicator JSX */}
              {/* ... */}

              {/* Current Step Component com a prop de reset */}
              <CurrentStepComponent
                bookingData={bookingData}
                updateBookingData={updateBookingData}
                nextStep={nextStep}
                prevStep={prevStep}
                // Passa a função de reset apenas para o último passo
                {...(currentStep === 5 && { resetBooking: resetBooking })}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
