import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { generateGameCode, generateUsername, generateQuestions } from "@/lib/questionBank";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, Play } from "lucide-react";

const Host = () => {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState("");
  const [topic, setTopic] = useState("general");
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`
        },
        async () => {
          await loadPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const loadPlayers = async () => {
    if (!gameId) return;
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });
    
    if (data) setPlayers(data);
  };

  const createGame = async () => {
    setIsCreating(true);
    const code = generateGameCode();
    const name = hostName.trim() || generateUsername();
    
    try {
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({
          code,
          host_name: name,
          topic,
          status: 'lobby'
        })
        .select()
        .single();

      if (gameError) throw gameError;

      const { error: playerError } = await supabase
        .from('players')
        .insert({
          game_id: game.id,
          name,
          is_host: true
        });

      if (playerError) throw playerError;

      const questions = generateQuestions(topic, 5);
      const questionsToInsert = questions.map((q, index) => ({
        game_id: game.id,
        question_text: q.question_text,
        options: q.options,
        answer_index: q.answer_index,
        time_limit: q.time_limit,
        question_order: index
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      setGameId(game.id);
      setGameCode(code);
      await loadPlayers();
      toast.success(`Game created! Code: ${code}`);
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
      setIsCreating(false);
    }
  };

  const startGame = async () => {
    if (!gameId) return;

    try {
      const { error } = await supabase
        .from('games')
        .update({ status: 'playing', current_question_index: 0 })
        .eq('id', gameId);

      if (error) throw error;

      navigate(`/play/${gameCode}`);
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start game');
    }
  };

  if (gameId && gameCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quiz-gray via-background to-quiz-gray p-4">
        <Card className="w-full max-w-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-5xl font-bold text-primary mb-2">{gameCode}</h2>
              <p className="text-muted-foreground">Share this code with players</p>
            </div>

            <div className="bg-quiz-gray rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Players ({players.length})</h3>
              </div>
              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                  >
                    <span className="font-medium">{player.name}</span>
                    {player.is_host && (
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded">HOST</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={startGame}
              disabled={players.length < 1}
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quiz-gray via-background to-quiz-gray p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Host a Quiz
            </h2>
            <p className="text-muted-foreground">Create a game for your friends</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Name (optional)</label>
              <Input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Leave blank for random name"
                className="h-12"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Topic</label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Knowledge</SelectItem>
                  <SelectItem value="math">Math</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={createGame}
              disabled={isCreating}
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isCreating ? 'Creating...' : 'Create Game'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Host;
