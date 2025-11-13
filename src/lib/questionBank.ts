export interface Question {
  question_text: string;
  options: string[];
  answer_index: number;
  time_limit: number;
}

const mathQuestions: Question[] = [
  { question_text: '5 × 6 = ?', options: ['11', '30', '20', '35'], answer_index: 1, time_limit: 15 },
  { question_text: '12 ÷ 4 = ?', options: ['2', '3', '4', '6'], answer_index: 1, time_limit: 15 },
  { question_text: '7 + 8 = ?', options: ['13', '14', '15', '16'], answer_index: 2, time_limit: 15 },
  { question_text: '10 - 3 = ?', options: ['8', '6', '7', '9'], answer_index: 2, time_limit: 15 },
  { question_text: '3² = ?', options: ['6', '9', '12', '8'], answer_index: 1, time_limit: 15 },
  { question_text: '15 + 25 = ?', options: ['35', '40', '45', '50'], answer_index: 1, time_limit: 15 },
  { question_text: '8 × 7 = ?', options: ['54', '56', '58', '60'], answer_index: 1, time_limit: 15 },
];

const scienceQuestions: Question[] = [
  { question_text: 'Water chemical formula?', options: ['H2O', 'CO2', 'O2', 'H2'], answer_index: 0, time_limit: 15 },
  { question_text: 'Gas we breathe in?', options: ['Hydrogen', 'Oxygen', 'Nitrogen', 'Helium'], answer_index: 1, time_limit: 15 },
  { question_text: 'Sun is a?', options: ['Planet', 'Star', 'Asteroid', 'Comet'], answer_index: 1, time_limit: 15 },
  { question_text: 'Human body organ?', options: ['Liver', 'Stone', 'Bicycle', 'Glass'], answer_index: 0, time_limit: 15 },
  { question_text: 'What causes tides?', options: ['Wind', 'Sun', 'Moon', 'Clouds'], answer_index: 2, time_limit: 15 },
  { question_text: 'How many planets in our solar system?', options: ['7', '8', '9', '10'], answer_index: 1, time_limit: 15 },
  { question_text: 'What is the speed of light?', options: ['300,000 km/s', '150,000 km/s', '200,000 km/s', '100,000 km/s'], answer_index: 0, time_limit: 15 },
];

const generalQuestions: Question[] = [
  { question_text: '2 + 2 = ?', options: ['3', '4', '5', '6'], answer_index: 1, time_limit: 15 },
  { question_text: 'Capital of India?', options: ['Mumbai', 'Kolkata', 'Delhi', 'Chennai'], answer_index: 2, time_limit: 15 },
  { question_text: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Venus'], answer_index: 1, time_limit: 15 },
  { question_text: 'What color do you get by mixing red and white?', options: ['Pink', 'Brown', 'Orange', 'Magenta'], answer_index: 0, time_limit: 15 },
  { question_text: 'HTML stands for?', options: ['HyperText Markup Language', 'HighText Machine Language', 'Hyperlink and Text Markup', 'Home Tool Markup Language'], answer_index: 0, time_limit: 15 },
  { question_text: 'How many days in a week?', options: ['5', '6', '7', '8'], answer_index: 2, time_limit: 15 },
  { question_text: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer_index: 3, time_limit: 15 },
];

export function generateQuestions(topic: string = 'general', count: number = 5): Question[] {
  const questionPool = topic === 'math' 
    ? mathQuestions 
    : topic === 'science' 
    ? scienceQuestions 
    : generalQuestions;
  
  const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function generateUsername(): string {
  const adjectives = ['Cool', 'Swift', 'Brave', 'Smart', 'Lucky', 'Fast', 'Bright', 'Wild'];
  const nouns = ['Tiger', 'Eagle', 'Shark', 'Wolf', 'Lion', 'Bear', 'Fox', 'Hawk'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${adjective}${noun}${number}`;
}

export function generateGameCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
