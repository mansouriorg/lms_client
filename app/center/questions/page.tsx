'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

// Mock data for a theory quiz
const quizData = [
  {
    id: 1,
    question: "When approaching a red traffic light, what is the absolute rule?",
    image: null,
    options: [
      "Slow down and proceed carefully if the intersection is clear.",
      "Stop completely behind the solid white line.",
      "Speed up to cross before intersecting traffic starts moving.",
      "Stop only if there are pedestrians crossing."
    ],
    correctAnswer: 1,
    explanation: "A red light means you must come to a complete stop behind the stop line or crosswalk."
  },
  {
    id: 2,
    question: "What does a solid double yellow line in the center of the road indicate?",
    image: null,
    options: [
      "Passing is permitted for both directions.",
      "Passing is permitted only during daylight hours.",
      "Passing is strictly prohibited for both directions.",
      "The road is merging into a single lane."
    ],
    correctAnswer: 2,
    explanation: "Solid double yellow lines mark the center of the road and separate traffic traveling in opposite directions. Passing is not allowed for either direction."
  },
  {
    id: 3,
    question: "When driving in heavy fog, which lights should you use?",
    image: null,
    options: [
      "High beam headlights.",
      "Parking lights only.",
      "Hazard lights continuously.",
      "Low beam headlights and fog lights if available."
    ],
    correctAnswer: 3,
    explanation: "High beams reflect off the moisture in the fog, blinding you. Always use low beams in fog, rain, or snow."
  }
];

export default function TheoryPracticePage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return; // Prevent changing answer after submission
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswered(true);
    if (selectedAnswer === quizData[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < quizData.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  // ---------------------------------------------------------------------------
  // RESULTS SCREEN
  // ---------------------------------------------------------------------------
  if (showResults) {
    const passPercentage = Math.round((score / quizData.length) * 100);
    const passed = passPercentage >= 80;

    return (
      <div className="max-w-3xl mx-auto pt-10">
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl text-center relative overflow-hidden">
          {/* Decorative background glow */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[60%] rounded-full blur-[120px] pointer-events-none ${passed ? 'bg-emerald-600/20' : 'bg-amber-600/20'}`} />
          
          <div className="relative z-10">
            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-2xl ${passed ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30' : 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30'}`}>
              <Trophy className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              {passed ? 'Outstanding Work!' : 'Keep Practicing!'}
            </h2>
            <p className="text-slate-400 mb-8">
              You scored <span className="text-white font-bold">{score}</span> out of <span className="text-white font-bold">{quizData.length}</span> questions correctly.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link 
                href="/student/dashboard"
                className="py-3 px-6 rounded-xl font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Back to Dashboard
              </Link>
              <button 
                onClick={resetQuiz}
                className="inline-flex items-center py-3 px-6 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ACTIVE QUIZ UI
  // ---------------------------------------------------------------------------
  const question = quizData[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Quiz Header & Progress */}
      <div className="flex items-center justify-between mb-2">
        <Link href="/student/dashboard" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Exit Quiz
        </Link>
        <span className="text-sm font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Question {currentQuestion + 1} of {quizData.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
        <div className="flex gap-4 mb-8">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-violet-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed tracking-tight mt-1">
            {question.question}
          </h2>
        </div>

        {/* Answer Options Grid */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            // Determine styling based on state
            let optionStyle = "bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300";
            let icon = null;

            if (isAnswered) {
              if (index === question.correctAnswer) {
                optionStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-100";
                icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
              } else if (index === selectedAnswer) {
                optionStyle = "bg-red-500/10 border-red-500/50 text-red-100";
                icon = <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
              } else {
                optionStyle = "bg-slate-900/30 border-slate-800 text-slate-500 opacity-50"; // Dim unselected
              }
            } else if (selectedAnswer === index) {
              optionStyle = "bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]";
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between gap-4 ${optionStyle}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${selectedAnswer === index && !isAnswered ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                  </span>
                  <span className="font-medium text-sm sm:text-base leading-snug">{option}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Explanation (Shows only after answering) */}
        {isAnswered && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="shrink-0 mt-0.5 text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Explanation: </span>
              {question.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-4">
        {!isAnswered ? (
          <button
            onClick={handleCheckAnswer}
            disabled={selectedAnswer === null}
            className="inline-flex items-center py-3 px-8 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="inline-flex items-center py-3 px-8 rounded-xl font-semibold text-slate-900 bg-white hover:bg-slate-200 transition-all duration-200 shadow-lg shadow-white/10"
          >
            {currentQuestion + 1 === quizData.length ? 'View Results' : 'Next Question'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        )}
      </div>

    </div>
  );
}