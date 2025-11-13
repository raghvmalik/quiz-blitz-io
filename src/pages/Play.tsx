import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronRight, Trophy } from "lucide-react";

const Play = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    loadGame();
  }, [code]);

  useEffect(() => {
    if (!game) return;

    const channel = supabase
      .channel(`game-${game.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${game.id}`
        },
        async (payload) => {
          setGame(payload.new);
          if (payload.new.status === 'finished') {
            navigate(`/results/${code}`);
          } else if (payload.new.current_question_index !== game.current_question_index) {
            setHasAnswered(false);
            setSelectedAnswer(null);
            setTimeLeft(15);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${game.id}`
        },
        async () => {
          await loadPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game]);

  useEffect(() => {
    if (game && questions.length > 0 && game.current_question_index >= 0) {
      setCurrentQuestion(questions[game.current_question_index]);
    }
  }, [game?.current_question_index, questions]);

  useEffect(() => {
    if (!currentQuestion || hasAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, hasAnswered]);

  const loadGame = async () => {
    const { data: gameData } = await supabase
      .from('games')
      .select('*')
      .eq('code', code)
      .single();

    if (gameData) {
      setGame(gameData);
      if (gameData.status === 'finished') {
        navigate(`/results/${code}`);
        return;
      }
      await loadQuestions(gameData.id);
      await loadPlayers();
    }
  };

  const loadQuestions = async (gameId: string) => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('game_id', gameId)
      .order('question_order', { ascending: true });
    
    if (data) setQuestions(data);
  };

  const loadPlayers = async () => {
    if (!game) return;
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', game.id)
      .order('score', { ascending: false });
    
    if (data) setPlayers(data);
  };

  const submitAnswer = async (answerIndex: number) => {
    if (hasAnswered || !currentQuestion || !game) return;

    setHasAnswered(true);
    setSelectedAnswer(answerIndex);

    const isCorrect = answerIndex === currentQuestion.answer_index;
    
    const currentPlayer = players.find(p => p.name === localStorage.getItem(`player_${code}`));
    if (!currentPlayer) return;

    const { error: answerError } = await supabase
      .from('answers')
      .insert({
        player_id: currentPlayer.id,
        question_id: currentQuestion.id,
        selected_index: answerIndex,
        is_correct: isCorrect
      });

    if (answerError) console.error('Error saving answer:', answerError);

    if (isCorrect) {
      const newScore = currentPlayer.score + 10;
      const { error: scoreError } = await supabase
        .from('players')
        .update({ score: newScore })
        .eq('id', currentPlayer.id);

      if (scoreError) console.error('Error updating score:', scoreError);
      else toast.success('+10 points!');
    }
  };

  const nextQuestion = async () => {
    if (!game || !currentPlayer?.is_host) return;

    const nextIndex = game.current_question_index + 1;
    
    if (nextIndex >= questions.length) {
      const { error } = await supabase
        .from('games')
        .update({ status: 'finished' })
        .eq('id', game.id);

      if (!error) navigate(`/results/${code}`);
    } else {
      await supabase
        .from('games')
        .update({ current_question_index: nextIndex })
        .eq('id', game.id);
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quiz-gray via-background to-quiz-gray">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  const currentPlayer = players.find(p => p.name === localStorage.getItem(`player_${code}`));

  if (game.status === 'lobby') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quiz-gray via-background to-quiz-gray p-4">
        <Card className="w-full max-w-2xl p-8 shadow-2xl">
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-primary">Waiting to start...</h2>
            <p className="text-muted-foreground">Host will start the game soon</p>
            <div className="bg-quiz-gray rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Players ({players.length})</h3>
              <div className="space-y-2">
                {players.map((player) => (
                  <div key={player.id} className="bg-white p-3 rounded-lg">
                    {player.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quiz-gray via-background to-quiz-gray">
        <p className="text-xl">Loading question...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quiz-gray via-background to-quiz-gray p-4">
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="bg-white px-6 py-3 rounded-full shadow-lg">
            <span className="font-bold text-lg">
              Question {game.current_question_index + 1} / {questions.length}
            </span>
          </div>
          <div className={`px-6 py-3 rounded-full shadow-lg font-bold text-lg ${
            timeLeft <= 5 ? 'bg-primary text-white animate-pulse' : 'bg-white'
          }`}>
            {timeLeft}s
          </div>
        </div>

        <Card className="p-8 shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 text-center">{currentQuestion.question_text}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentQuestion.options.map((option: string, index: number) => (
              <Button
                key={index}
                onClick={() => submitAnswer(index)}
                disabled={hasAnswered || timeLeft === 0}
                className={`h-20 text-lg font-bold transition-all duration-200 ${
                  hasAnswered
                    ? index === currentQuestion.answer_index
                      ? 'bg-green-500 hover:bg-green-500'
                      : index === selectedAnswer
                      ? 'bg-primary hover:bg-primary'
                      : 'bg-muted hover:bg-muted'
                    : index % 2 === 0
                    ? 'bg-primary hover:bg-primary/90 hover:scale-105'
                    : 'bg-secondary hover:bg-secondary/90 hover:scale-105'
                }`}
                variant={hasAnswered ? "outline" : "default"}
              >
                {option}
              </Button>
            ))}
          </div>

          {currentPlayer?.is_host && (
            <Button
              onClick={nextQuestion}
              className="w-full bg-accent hover:bg-accent/90"
              size="lg"
            >
              <ChevronRight className="w-5 h-5 mr-2" />
              Next Question
            </Button>
          )}
        </Card>

        <Card className="p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Live Scoreboard</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {players.slice(0, 4).map((player) => (
              <div key={player.id} className="bg-quiz-gray p-3 rounded-lg text-center">
                <div className="font-medium text-sm truncate">{player.name}</div>
                <div className="text-2xl font-bold text-primary">{player.score}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Store player name in localStorage when joining
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  const playerName = urlParams.get('name');
  const code = window.location.pathname.split('/').pop();
  if (playerName && code) {
    localStorage.setItem(`player_${code}`, playerName);
  }
}

export default Play;
