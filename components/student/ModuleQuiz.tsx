'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, ChevronLeft, RotateCcw, XCircle } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type ModuleResult,
  type PracticeQuiz,
  type QuizAnswer,
  type SavedAttempt,
  attemptAnswers,
  bestScoreText,
  quizScore,
  savedMessage,
  scoreMessage,
} from '@/lib/practice-quiz';
import { answerLetter } from '@/lib/quizzes';
import { practiceQuizService } from '@/services/practice-quiz.service';

const PLAIN_BUTTON =
  'inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors';
const MAIN_BUTTON =
  'inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50';

// The quiz of a module, one question at a time: the student chooses an
// answer, the API says if it is right (with the right one and why), then the
// score at the end. The finished quiz is sent to the API, which grades it and
// saves the score; `onSaved` gets the new best score. "Try again" loads the
// quiz again and starts over.
// Give it key={moduleId}: a new quiz starts from the first question.
export default function ModuleQuiz({
  moduleId,
  onClose,
  onSaved,
}: {
  moduleId: string;
  onClose: () => void;
  onSaved?: (result: ModuleResult) => void;
}) {
  const [quiz, setQuiz] = useState<PracticeQuiz | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  // The question shown, the answer selected, and the questions answered
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');
  const [finished, setFinished] = useState(false);
  // Saving the score of the finished quiz
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<SavedAttempt | null>(null);
  const [saveError, setSaveError] = useState('');
  // The API refused the answers (the quiz changed meanwhile): start again
  const [saveRefused, setSaveRefused] = useState(false);

  useEffect(() => {
    let active = true;
    practiceQuizService.get(moduleId).then(
      (loaded) => {
        if (active) {
          setQuiz(loaded);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load the quiz. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [moduleId, reloadKey]);

  // Start over with the quiz as it is now, and the best score updated
  const restart = () => {
    setIndex(0);
    setChosen(null);
    setAnswers([]);
    setCheckError('');
    setFinished(false);
    setSaved(null);
    setSaveError('');
    setSaveRefused(false);
    setQuiz(null);
    setReloadKey((key) => key + 1);
  };

  const save = async (given: QuizAnswer[]) => {
    setSaving(true);
    setSaveError('');
    setSaveRefused(false);
    try {
      const reply = await practiceQuizService.saveAttempt(moduleId, attemptAnswers(given));
      setSaved(reply);
      onSaved?.({ moduleId, best: reply.best, attempts: reply.attempts });
    } catch (error) {
      const status = (error as { response?: { status?: number } } | null)?.response?.status;
      setSaveRefused(status === 400);
      setSaveError(apiErrorMessage(error, 'Could not save your score. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const backButton = (
    <button type="button" onClick={onClose} className={PLAIN_BUTTON}>
      <ChevronLeft aria-hidden="true" className="w-4 h-4" />
      Back to the lessons
    </button>
  );

  if (loadError) {
    return (
      <div role="alert" className="p-6 rounded-2xl text-sm text-red-400 bg-red-400/10 border border-red-400/20 space-y-4">
        <p className="flex items-start gap-2">
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          {loadError}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setLoadError('');
              setReloadKey((key) => key + 1);
            }}
            className="inline-flex items-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
          {backButton}
        </div>
      </div>
    );
  }

  if (quiz === null) {
    return (
      <p role="status" className="p-6 text-sm text-slate-400 rounded-2xl bg-slate-900/50 border border-slate-800">
        Loading the quiz...
      </p>
    );
  }

  const total = quiz.questions.length;
  const header = (
    <div className="space-y-1">
      <p className="text-xs font-medium text-indigo-300 uppercase tracking-wider">Module quiz</p>
      <h2 className="text-xl font-semibold text-white">{quiz.module.title}</h2>
    </div>
  );

  if (total === 0) {
    return (
      <section className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        {header}
        <p className="text-sm text-slate-400">This module has no quiz questions yet.</p>
        {backButton}
      </section>
    );
  }

  if (finished) {
    const score = quizScore(answers);
    return (
      <section aria-labelledby="quiz-score" className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-5">
        {header}
        <div className="space-y-1">
          <p id="quiz-score" className="text-2xl font-bold text-white">
            {score.right} of {score.total} right ({score.percentage}%)
          </p>
          <p className="text-sm text-slate-400">{scoreMessage(score.percentage)}</p>
          {/* Always there, so screen readers announce the change */}
          <p role="status" className={`text-sm font-medium ${saved === null ? 'text-slate-400' : 'text-emerald-300'}`}>
            {saving ? 'Saving your score...' : saved === null ? '' : savedMessage(quiz.best, saved)}
          </p>
        </div>
        {saveError && (
          <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-red-400">
            <p className="flex items-start gap-2">
              <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
              {saveError}
            </p>
            {saveRefused === false && (
              <button
                type="button"
                onClick={() => save(answers)}
                disabled={saving}
                className="inline-flex items-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors disabled:opacity-50"
              >
                <RotateCcw aria-hidden="true" className="w-4 h-4" />
                Try saving again
              </button>
            )}
          </div>
        )}
        <ol className="space-y-2" aria-label="Your answers">
          {quiz.questions.map((question, place) => {
            const given = answers.find((item) => item.questionId === question.id);
            const right = given?.check.right === true;
            return (
              <li key={question.id} className="flex items-start gap-2 text-sm text-slate-300">
                {right ? (
                  <CheckCircle2 role="img" aria-label="Right" className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle role="img" aria-label="Wrong" className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                )}
                <span>
                  {place + 1}. {question.text}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={restart} disabled={saving} className={MAIN_BUTTON}>
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
          {backButton}
        </div>
      </section>
    );
  }

  const question = quiz.questions[index];
  const answered = answers.find((item) => item.questionId === question.id) ?? null;
  const last = index + 1 === total;

  const check = async () => {
    if (chosen === null) return;
    setChecking(true);
    setCheckError('');
    try {
      const reply = await practiceQuizService.check(question.id, chosen);
      setAnswers((current) => [...current, { questionId: question.id, chosen, check: reply }]);
    } catch (error) {
      setCheckError(apiErrorMessage(error, 'Could not check your answer. Please try again.'));
    } finally {
      setChecking(false);
    }
  };

  const next = () => {
    if (last) {
      // Every question is answered: show the score and save it
      setFinished(true);
      save(answers);
      return;
    }
    setIndex(index + 1);
    setChosen(null);
    setCheckError('');
  };

  return (
    <section className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          {header}
          {quiz.best ? <p className="text-xs text-slate-400">{bestScoreText(quiz.best, quiz.attempts)}</p> : null}
        </div>
        {backButton}
      </div>
      <div className="space-y-2">
        <p className="text-sm text-slate-400">
          Question {index + 1} of {total}
        </p>
        <div
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answers.length}
          className="h-2 w-full rounded-full bg-slate-800 overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${Math.round((answers.length / total) * 100)}%` }}
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-base font-medium text-white whitespace-pre-wrap break-words mb-3">{question.text}</legend>
        {question.options.map((option, place) => {
          const isRight = answered !== null && answered.check.correctAnswer === place;
          const isWrongChoice = answered !== null && answered.chosen === place && answered.check.right === false;
          const look = isRight
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
            : isWrongChoice
              ? 'border-red-500/40 bg-red-500/10 text-red-200'
              : chosen === place
                ? 'border-indigo-500/60 bg-indigo-500/10 text-white'
                : 'border-slate-700 text-slate-200 hover:bg-slate-800/60';
          return (
            <label
              key={place}
              className={`flex items-start gap-3 p-3 rounded-xl border text-sm transition-colors ${look} ${
                answered === null ? 'cursor-pointer' : ''
              }`}
            >
              <input
                type="radio"
                name={`quiz-${question.id}`}
                checked={chosen === place}
                disabled={answered !== null || checking}
                onChange={() => setChosen(place)}
                className="mt-0.5 w-4 h-4 shrink-0 border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="font-semibold w-4 shrink-0">{answerLetter(place)}</span>
              <span className="flex-1 break-words">{option}</span>
              {isRight && <span className="text-xs font-medium shrink-0">Right answer</span>}
              {isWrongChoice && <span className="text-xs font-medium shrink-0">Your answer</span>}
            </label>
          );
        })}
      </fieldset>

      {answered !== null && (
        <div
          role="status"
          className={`p-4 rounded-xl text-sm border space-y-1 ${
            answered.check.right
              ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
              : 'text-amber-200 bg-amber-500/10 border-amber-500/20'
          }`}
        >
          <p className="font-semibold">
            {answered.check.right
              ? 'Right answer.'
              : `Not quite: the right answer is ${answerLetter(answered.check.correctAnswer)}.`}
          </p>
          {answered.check.explanation && (
            <p className="text-slate-300 whitespace-pre-wrap break-words">{answered.check.explanation}</p>
          )}
        </div>
      )}

      {checkError && (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-400">
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          {checkError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {answered === null ? (
          <button type="button" onClick={check} disabled={chosen === null || checking} className={MAIN_BUTTON}>
            {checking ? 'Checking...' : 'Check my answer'}
          </button>
        ) : (
          <button type="button" onClick={next} className={MAIN_BUTTON}>
            {last ? 'See my score' : 'Next question'}
            <ArrowRight aria-hidden="true" className="w-4 h-4" />
          </button>
        )}
        <p className="text-xs text-slate-500">Your score is saved when you finish the quiz.</p>
      </div>
    </section>
  );
}
