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

  // Check for pre-selected service from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const servicoId = urlParams.get('servico');
    if (servicoId) {
      setBookingData(prev => ({ ...prev, servico_id: parseInt(servicoId) }));
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
    setBookingData(prev => ({ ...prev, ...data }));
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

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-16">
        <section className="py-20 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Agendamento <span className="text-elite-gold">Online</span>
              </h1>
              <p className="text-xl text-gray-300">
                Reserve seu horário em poucos cliques. Sistema inteligente que mostra apenas horários disponíveis.
              </p>
            </div>

            {/* Booking Form */}
            <div className="elite-dark rounded-2xl p-8 shadow-2xl">
              {/* Step Indicator */}
              <div className="flex justify-between items-center mb-8 overflow-x-auto">
                <div className="flex items-center space-x-2 md:space-x-4 min-w-max">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          currentStep >= step.number 
                            ? 'bg-elite-gold text-black' 
                            : 'bg-gray-600 text-gray-400'
                        }`}>
                          {step.number}
                        </div>
                        <span className={`ml-2 font-semibold text-sm md:text-base ${
                          currentStep >= step.number 
                            ? 'text-elite-gold' 
                            : 'text-gray-400'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-8 md:w-12 h-0.5 bg-gray-600 mx-2 md:mx-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Step Component */}
              <CurrentStepComponent
                bookingData={bookingData}
                updateBookingData={updateBookingData}
                nextStep={nextStep}
                prevStep={prevStep}
                currentStep={currentStep}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
