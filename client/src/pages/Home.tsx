import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, User, Trophy, Star, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

interface AccountData {
  id: number;
  nickname: string;
  level: number;
  xp: number;
  access_token: string;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [accountData, setAccountData] = useState<AccountData | null>(null);

  const queryMutation = trpc.account.query.useMutation({
    onSuccess: (data) => {
      setAccountData(data.data);
      toast.success("Conta consultada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao consultar conta");
      setAccountData(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Por favor, insira os dados da conta");
      return;
    }
    queryMutation.mutate({ input: input.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-white">{APP_TITLE}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white">
              Consulte Informações da sua Conta
            </h2>
            <p className="text-lg text-slate-400">
              Insira suas credenciais no formato UID:PASSWORD ou JSON da Garena
            </p>
          </div>

          {/* Input Form */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Dados da Conta</CardTitle>
              <CardDescription className="text-slate-400">
                Cole suas credenciais em um dos formatos suportados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder='Formato 1: 4218099837:C95587DF1ECEA5E312FEFE89E04F38CE75A8E785CEBF5910407373AB37FFA474&#10;&#10;Formato 2: {"guest_account_info":{"com.garena.msdk.guest_uid":"4218099837","com.garena.msdk.guest_password":"C95587DF1ECEA5E312FEFE89E04F38CE75A8E785CEBF5910407373AB37FFA474"}}'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[120px] bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 font-mono text-sm"
                    disabled={queryMutation.isPending}
                  />
                </div>

                <Alert className="bg-slate-950/50 border-slate-700">
                  <AlertDescription className="text-slate-400 text-sm">
                    <strong className="text-white">Formatos aceitos:</strong>
                    <br />
                    • UID:PASSWORD (ex: 4218099837:C95587DF...)
                    <br />• JSON da Garena (formato completo)
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={queryMutation.isPending}
                >
                  {queryMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Consultar Conta
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {accountData && (
            <Card className="bg-gradient-to-br from-orange-950/30 to-slate-900/50 border-orange-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Account ID */}
                  <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                    <div className="text-sm text-slate-400 mb-1">ID da Conta</div>
                    <div className="text-xl font-bold text-white font-mono">
                      {accountData.id}
                    </div>
                  </div>

                  {/* Nickname */}
                  <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                    <div className="text-sm text-slate-400 mb-1">Nickname</div>
                    <div className="text-xl font-bold text-orange-400">
                      {accountData.nickname}
                    </div>
                  </div>

                  {/* Level */}
                  <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                    <div className="text-sm text-slate-400 mb-1 flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      Nível
                    </div>
                    <div className="text-xl font-bold text-white">
                      {accountData.level}
                    </div>
                  </div>

                  {/* XP */}
                  <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                    <div className="text-sm text-slate-400 mb-1 flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Experiência
                    </div>
                    <div className="text-xl font-bold text-white">
                      {accountData.xp.toLocaleString()} XP
                    </div>
                  </div>
                </div>

                {/* Access Token */}
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                  <div className="text-sm text-slate-400 mb-2">Access Token</div>
                  <div className="text-sm font-mono text-slate-300 break-all bg-slate-900 p-3 rounded border border-slate-700">
                    {accountData.access_token}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <Alert className="bg-slate-900/50 border-slate-700">
            <Shield className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-slate-300">
              <strong className="text-white">Segurança:</strong> Todas as requisições são
              criptografadas e processadas através de um servidor intermediário para proteger
              suas credenciais.
            </AlertDescription>
          </Alert>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          {APP_TITLE} - Consulta segura de contas Free Fire
        </div>
      </footer>
    </div>
  );
}

