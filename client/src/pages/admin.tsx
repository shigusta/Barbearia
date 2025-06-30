import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Scissors,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  EyeOff,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { AgendamentoComRelacoes } from "@shared/schema";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [filter, setFilter] = useState<"todos" | "confirmado" | "cancelado" | "concluido">("todos");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agendamentos, isLoading } = useQuery<AgendamentoComRelacoes[]>({
    queryKey: ["/api/agendamentos"],
    enabled: isAuthenticated,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest('PATCH', `/api/agendamentos/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agendamentos"] });
      toast({
        title: "Status Atualizado",
        description: "O status do agendamento foi atualizado com sucesso.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o status.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const deleteAgendamentoMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/agendamentos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agendamentos"] });
      toast({
        title: "Agendamento Excluído",
        description: "O agendamento foi excluído com sucesso.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o agendamento.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use proper authentication
    if (password === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Acesso Autorizado",
        description: "Bem-vindo ao painel administrativo.",
        duration: 3000,
      });
    } else {
      toast({
        title: "Acesso Negado",
        description: "Senha incorreta.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-blue-600 text-white">Confirmado</Badge>;
      case "concluido":
        return <Badge className="bg-green-600 text-white">Concluído</Badge>;
      case "cancelado":
        return <Badge className="bg-red-600 text-white">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredAgendamentos = agendamentos?.filter(agendamento => {
    if (filter === "todos") return true;
    return agendamento.status === filter;
  });

  const todayAppointments = agendamentos?.filter(agendamento => {
    const today = new Date();
    const appointmentDate = new Date(agendamento.data_hora_inicio);
    return appointmentDate.toDateString() === today.toDateString();
  });

  const stats = {
    total: agendamentos?.length || 0,
    hoje: todayAppointments?.length || 0,
    confirmados: agendamentos?.filter(a => a.status === "confirmado").length || 0,
    concluidos: agendamentos?.filter(a => a.status === "concluido").length || 0,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 elite-gray">
          <CardHeader className="text-center">
            <Shield className="mx-auto h-12 w-12 text-elite-gold mb-4" />
            <CardTitle className="text-2xl font-display text-elite-gold">
              Painel Administrativo
            </CardTitle>
            <p className="text-gray-400">Digite a senha para acessar</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha de administrador"
                  className="bg-black border-gray-600 text-white focus:border-elite-gold"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-elite-gold hover:bg-yellow-500 text-black font-semibold"
              >
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-elite-gold">
              Painel Administrativo
            </h1>
            <p className="text-gray-400">Gerencie os agendamentos da barbearia</p>
          </div>
          <Button
            onClick={() => setIsAuthenticated(false)}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-600"
          >
            <EyeOff className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="elite-gray">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-elite-gold">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-elite-gold" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="elite-gray">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Hoje</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.hoje}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="elite-gray">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Confirmados</p>
                  <p className="text-2xl font-bold text-green-400">{stats.confirmados}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="elite-gray">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Concluídos</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.concluidos}</p>
                </div>
                <Scissors className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "todos", label: "Todos" },
            { key: "confirmado", label: "Confirmados" },
            { key: "concluido", label: "Concluídos" },
            { key: "cancelado", label: "Cancelados" },
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              variant={filter === filterOption.key ? "default" : "outline"}
              size="sm"
              className={
                filter === filterOption.key
                  ? "bg-elite-gold text-black hover:bg-yellow-500"
                  : "border-gray-600 text-gray-300 hover:bg-gray-600"
              }
            >
              {filterOption.label}
            </Button>
          ))}
        </div>

        {/* Appointments List */}
        <Card className="elite-gray">
          <CardHeader>
            <CardTitle className="text-elite-gold">
              Agendamentos {filter !== "todos" && `- ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : filteredAgendamentos && filteredAgendamentos.length > 0 ? (
              <div className="space-y-4">
                {filteredAgendamentos
                  .sort((a, b) => new Date(b.data_hora_inicio).getTime() - new Date(a.data_hora_inicio).getTime())
                  .map((agendamento) => (
                    <Card key={agendamento.id} className="bg-black border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Main Info */}
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Cliente</p>
                              <p className="font-semibold flex items-center">
                                <User className="mr-2 h-4 w-4 text-elite-gold" />
                                {agendamento.nome_cliente}
                              </p>
                              <p className="text-sm text-gray-400 flex items-center mt-1">
                                <Phone className="mr-1 h-3 w-3" />
                                {agendamento.telefone_cliente}
                              </p>
                              <p className="text-sm text-gray-400 flex items-center mt-1">
                                <Mail className="mr-1 h-3 w-3" />
                                {agendamento.email_cliente}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Serviço</p>
                              <p className="font-semibold">{agendamento.servico.nome}</p>
                              <p className="text-sm text-gray-400">
                                {formatDuration(agendamento.servico.duracao_minutos)} - {formatCurrency(agendamento.servico.preco)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Barbeiro</p>
                              <p className="font-semibold">{agendamento.barbeiro.nome}</p>
                              <p className="text-sm text-gray-400">
                                {formatDateTime(agendamento.data_hora_inicio)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Status</p>
                              {getStatusBadge(agendamento.status)}
                              {agendamento.observacoes && (
                                <p className="text-xs text-gray-400 mt-2">
                                  <strong>Obs:</strong> {agendamento.observacoes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {agendamento.status === "confirmado" && (
                              <Button
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ id: agendamento.id, status: "concluido" })}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Concluir
                              </Button>
                            )}
                            
                            {agendamento.status === "confirmado" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateStatusMutation.mutate({ id: agendamento.id, status: "cancelado" })}
                                disabled={updateStatusMutation.isPending}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Cancelar
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteAgendamentoMutation.mutate(agendamento.id)}
                              className="border-gray-600 text-gray-300 hover:bg-red-600 hover:border-red-600"
                              disabled={deleteAgendamentoMutation.isPending}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-500">
                  {filter === "todos" 
                    ? "Ainda não há agendamentos no sistema."
                    : `Não há agendamentos com status "${filter}".`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
