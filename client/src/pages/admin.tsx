import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  EyeOff,
  Shield,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  formatCurrency,
  formatDateTime,
  formatDuration,
  formatDate,
} from "@/lib/utils";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import type {
  AgendamentoComRelacoes,
  Barbeiro,
  BloqueioAgenda,
} from "@shared/schema";

// --- Componente para Gerir Bloqueios ---
function ScheduleBlockManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: barbeiros } = useQuery<Barbeiro[]>({
    queryKey: ["/api/barbeiros"],
  });
  const { data: bloqueios, isLoading } = useQuery<BloqueioAgenda[]>({
    queryKey: ["/api/bloqueios"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!localStorage.getItem("authToken"),
  });

  const [data, setData] = useState("");
  const [hora_inicio, setHoraInicio] = useState("");
  const [hora_fim, setHoraFim] = useState("");
  const [motivo, setMotivo] = useState("");
  const [barbeiro_id, setBarbeiroId] = useState<string>("null");

  const createBlockMutation = useMutation({
    mutationFn: async () => {
      if (!data || !hora_inicio || !hora_fim) {
        throw new Error("Data, hora de início e hora de fim são obrigatórios.");
      }
      const parsedBarbeiroId =
        barbeiro_id === "null" ? null : parseInt(barbeiro_id, 10);
      return apiRequest("POST", "/api/bloqueios", {
        data,
        hora_inicio,
        hora_fim,
        motivo,
        barbeiro_id: parsedBarbeiroId,
      });
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Bloqueio de agenda criado." });
      queryClient.invalidateQueries({ queryKey: ["/api/bloqueios"] });
      setData("");
      setHoraInicio("");
      setHoraFim("");
      setMotivo("");
      setBarbeiroId("null");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/bloqueios/${id}`),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Bloqueio removido." });
      queryClient.invalidateQueries({ queryKey: ["/api/bloqueios"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="elite-gray mt-8">
      <CardHeader>
        <CardTitle className="text-elite-gold flex items-center">
          <Lock className="mr-2" />
          Gerir Bloqueios na Agenda
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Criar Novo Bloqueio</h4>
          <div>
            <label className="text-sm text-gray-300 block mb-1">Data</label>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="bg-black border-gray-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 block mb-1">
                Hora Início
              </label>
              <Input
                type="time"
                value={hora_inicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="bg-black border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">
                Hora Fim
              </label>
              <Input
                type="time"
                value={hora_fim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="bg-black border-gray-600"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1">Barbeiro</label>
            <Select onValueChange={setBarbeiroId} value={barbeiro_id}>
              <SelectTrigger className="bg-black border-gray-600">
                <SelectValue placeholder="Todos os barbeiros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Todos os barbeiros</SelectItem>
                {barbeiros?.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1">
              Motivo (Opcional)
            </label>
            <Input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Almoço, Reunião, Feriado"
              className="bg-black border-gray-600"
            />
          </div>
          <Button
            onClick={() => createBlockMutation.mutate()}
            disabled={createBlockMutation.isPending}
            className="w-full bg-elite-gold hover:bg-yellow-500 text-black font-semibold"
          >
            {createBlockMutation.isPending ? "A criar..." : "Criar Bloqueio"}
          </Button>
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold text-lg">Bloqueios Agendados</h4>
          <div className="max-h-80 overflow-y-auto pr-2">
            {isLoading && (
              <p className="text-gray-400">A carregar bloqueios...</p>
            )}
            {bloqueios && bloqueios.length === 0 && (
              <p className="text-gray-400 text-center py-4">
                Nenhum bloqueio encontrado.
              </p>
            )}
            {bloqueios?.map((bloqueio) => (
              <Card key={bloqueio.id} className="bg-black border-gray-700 mb-2">
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {bloqueio.motivo || "Pausa"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDate(new Date(bloqueio.data_inicio))}
                    </p>
                    <p className="text-sm text-gray-400">
                      {
                        formatDateTime(new Date(bloqueio.data_inicio)).split(
                          " "
                        )[1]
                      }{" "}
                      -{" "}
                      {
                        formatDateTime(new Date(bloqueio.data_fim)).split(
                          " "
                        )[1]
                      }
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBlockMutation.mutate(bloqueio.id)}
                    disabled={deleteBlockMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Componente Admin Principal (COMPLETO) ---
export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [filter, setFilter] = useState<
    "todos" | "confirmado" | "cancelado" | "concluido"
  >("todos");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsAuthenticated(true);
  }, []);

  const { data: agendamentos, isLoading } = useQuery<AgendamentoComRelacoes[]>({
    queryKey: ["/api/agendamentos"],
    enabled: isAuthenticated,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/agendamentos/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agendamentos"] });
      toast({
        title: "Status Atualizado",
        description: "O status do agendamento foi atualizado.",
      });
    },
    onError: (error: any) =>
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      }),
  });

  const deleteAgendamentoMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/agendamentos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agendamentos"] });
      toast({ title: "Agendamento Excluído" });
    },
    onError: (error: any) =>
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      }),
  });

  const loginMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/login", { username, password }),
    onSuccess: async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Usuário ou senha incorretos.");
      }
      const result = await response.json();
      if (result.token) {
        localStorage.setItem("authToken", result.token);
        setIsAuthenticated(true);
        toast({
          title: "Acesso Autorizado",
          description: "Bem-vindo ao painel.",
        });
      } else {
        throw new Error(result.message || "Falha no login.");
      }
    },
    onError: (error: any) =>
      toast({
        title: "Acesso Negado",
        description: error.message,
        variant: "destructive",
      }),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
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

  const filteredAgendamentos = agendamentos?.filter((agendamento) => {
    if (filter === "todos") return true;
    return agendamento.status === filter;
  });

  const stats = {
    total: agendamentos?.length || 0,
    hoje:
      agendamentos?.filter(
        (a) =>
          formatDate(new Date(a.data_hora_inicio)) === formatDate(new Date())
      ).length || 0,
    confirmados:
      agendamentos?.filter((a) => a.status === "confirmado").length || 0,
    concluidos:
      agendamentos?.filter((a) => a.status === "concluido").length || 0,
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
            <p className="text-gray-400">Digite as credenciais para acessar</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuário"
                  className="bg-black border-gray-600"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="bg-black border-gray-600"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-elite-gold hover:bg-yellow-500 text-black font-semibold"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-elite-gold">
              Painel Administrativo
            </h1>
            <p className="text-gray-400">
              Gerencie os agendamentos e bloqueios da barbearia
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-gray-600 hover:bg-gray-600"
          >
            <EyeOff className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="elite-gray">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-elite-gold">
                    {stats.total}
                  </p>
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
                  <p className="text-2xl font-bold text-blue-400">
                    {stats.hoje}
                  </p>
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
                  <p className="text-2xl font-bold text-green-400">
                    {stats.confirmados}
                  </p>
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
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.concluidos}
                  </p>
                </div>
                <Scissors className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {["todos", "confirmado", "concluido", "cancelado"].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f as any)}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className={
                filter === f
                  ? "bg-elite-gold text-black hover:bg-yellow-500"
                  : "border-gray-600 text-gray-300 hover:bg-gray-600"
              }
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        <Card className="elite-gray">
          <CardHeader>
            <CardTitle className="text-elite-gold">Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>A carregar agendamentos...</p>
            ) : filteredAgendamentos && filteredAgendamentos.length > 0 ? (
              <div className="space-y-4">
                {filteredAgendamentos.map((agendamento) => (
                  <Card
                    key={agendamento.id}
                    className="bg-black border-gray-700"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">
                              Cliente
                            </p>
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
                            <p className="text-sm text-gray-400 mb-1">
                              Serviço
                            </p>
                            <p className="font-semibold">
                              {agendamento.servico.nome}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatDuration(
                                agendamento.servico.duracao_minutos
                              )}{" "}
                              - {formatCurrency(agendamento.servico.preco)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">
                              Barbeiro
                            </p>
                            <p className="font-semibold">
                              {agendamento.barbeiro.nome}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatDateTime(
                                new Date(agendamento.data_hora_inicio)
                              )}
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
                        <div className="flex flex-wrap gap-2">
                          {agendamento.status === "confirmado" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: agendamento.id,
                                  status: "concluido",
                                })
                              }
                              className="bg-green-600 hover:bg-green-700"
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
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: agendamento.id,
                                  status: "cancelado",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Cancelar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              deleteAgendamentoMutation.mutate(agendamento.id)
                            }
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
              </div>
            )}
          </CardContent>
        </Card>

        <ScheduleBlockManager />
      </div>
    </div>
  );
}
