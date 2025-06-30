import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scissors, Crown, Eye } from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { Servico } from "@shared/schema";

interface ServiceCardProps {
  servico: Servico;
  featured?: boolean;
}

const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('combo') || name.includes('completo')) {
    return Crown;
  }
  if (name.includes('sobrancelha')) {
    return Eye;
  }
  return Scissors;
};

export default function ServiceCard({ servico, featured = false }: ServiceCardProps) {
  const Icon = getServiceIcon(servico.nome);

  return (
    <Card className={`elite-gray hover:bg-gray-700 transition-all duration-300 group relative ${featured ? 'border-elite-gold' : ''}`}>
      {featured && (
        <Badge className="absolute top-4 right-4 bg-elite-red text-white">
          Mais Popular
        </Badge>
      )}
      <CardContent className="p-8 text-center">
        <div className="bg-elite-gold text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-display font-bold mb-4 text-elite-gold">
          {servico.nome}
        </h3>
        <p className="text-gray-300 mb-6">
          {servico.descricao}
        </p>
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-400">
            Duração: {formatDuration(servico.duracao_minutos)}
          </span>
          <span className="text-xl font-bold text-elite-gold">
            {formatCurrency(servico.preco)}
          </span>
        </div>
        <Link href={`/agendamento?servico=${servico.id}`}>
          <Button className="w-full bg-elite-gold hover:bg-yellow-500 text-black font-semibold transition-colors duration-300">
            Agendar Agora
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
