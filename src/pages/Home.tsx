import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quiz-gray via-background to-quiz-gray p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl">
              <Gamepad2 className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Quiz Game
            </h1>
            <p className="text-muted-foreground text-lg">
              Create or join a quiz and compete with friends!
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/host')} 
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
              size="lg"
            >
              Host Game
            </Button>
            
            <Button 
              onClick={() => navigate('/join')} 
              className="w-full h-14 text-lg font-bold bg-secondary hover:bg-secondary/90 transition-all duration-200 hover:scale-105"
              size="lg"
            >
              Join Game
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            Real-time multiplayer • Random usernames • Fun topics
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Home;
