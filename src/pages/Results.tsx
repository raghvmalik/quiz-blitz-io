import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Home } from "lucide-react";

const Results = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    loadResults();
  }, [code]);

  const loadResults = async () => {
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('code', code)
      .single();

    if (game) {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', game.id)
        .order('score', { ascending: false });
      
      if (data) setPlayers(data);
    }
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (index === 1) return <Medal className="w-7 h-7 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getPositionColor = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-400';
    if (index === 2) return 'bg-gradient-to-r from-amber-500 to-amber-600';
    return 'bg-white';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quiz-gray via-background to-quiz-gray p-4">
      <Card className="w-full max-w-2xl p-8 shadow-2xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Trophy className="w-20 h-20 text-primary animate-bounce" />
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Game Results
          </h1>

          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`${
                  getPositionColor(index)
                } ${
                  index < 3 ? 'text-white' : ''
                } p-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getMedalIcon(index) || (
                        <span className="text-2xl font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <div className={`font-bold text-lg ${index >= 3 ? 'text-foreground' : ''}`}>
                        {player.name}
                      </div>
                      {player.is_host && (
                        <span className={`text-xs ${index >= 3 ? 'text-muted-foreground' : 'text-white/80'}`}>
                          HOST
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${index >= 3 ? 'text-primary' : ''}`}>
                    {player.score}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Button
              onClick={() => navigate('/')}
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Results;
