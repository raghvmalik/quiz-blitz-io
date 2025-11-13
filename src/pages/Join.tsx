import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { generateUsername } from "@/lib/questionBank";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

const Join = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const joinGame = async () => {
    if (!code.trim()) {
      toast.error('Please enter a game code');
      return;
    }

    setIsJoining(true);
    const name = playerName.trim() || generateUsername();

    try {
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('code', code.trim())
        .single();

      if (gameError || !game) {
        toast.error('Game not found');
        setIsJoining(false);
        return;
      }

      if (game.status !== 'lobby') {
        toast.error('Game already started');
        setIsJoining(false);
        return;
      }

      const { error: playerError } = await supabase
        .from('players')
        .insert({
          game_id: game.id,
          name,
          is_host: false
        });

      if (playerError) throw playerError;

      toast.success(`Joined as ${name}!`);
      navigate(`/play/${code}`);
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quiz-gray via-background to-quiz-gray p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">
              Join a Quiz
            </h2>
            <p className="text-muted-foreground">Enter the game code to play</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Name (optional)</label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Leave blank for random name"
                className="h-12"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Game Code</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 4-digit code"
                maxLength={4}
                className="h-12 text-center text-2xl font-bold tracking-widest"
              />
            </div>

            <Button
              onClick={joinGame}
              disabled={isJoining}
              className="w-full h-14 text-lg font-bold bg-secondary hover:bg-secondary/90"
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {isJoining ? 'Joining...' : 'Join Game'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Join;
