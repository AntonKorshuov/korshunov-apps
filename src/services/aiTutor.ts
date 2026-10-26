import { Exercise } from '../types';

export interface TutorResponse {
  message: string;
  isAi: boolean;
  type: 'hint' | 'praise' | 'correction';
}

export class AiTutorService {
  private apiKey: string = '';

  constructor() {
    this.apiKey = localStorage.getItem('mathe_gemini_key') || '';
  }

  public setApiKey(key: string) {
    this.apiKey = key.trim();
    localStorage.setItem('mathe_gemini_key', this.apiKey);
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  // Socratic feedback when student enters an incorrect answer
  public async getFeedbackForMistake(
    exercise: Exercise,
    studentAnswer: string | number
  ): Promise<TutorResponse> {
    if (this.apiKey) {
      try {
        const prompt = `Du bist 'Trainer Max', ein motivierender, freundlicher Mathe-Trainer für einen 10-jährigen Schüler in der 5. Klasse einer deutschen Schule (Realschule/Gesamtschule).
Der Schüler mag Fußball sehr gerne.

Aufgabe: "${exercise.question}"
Thema: ${exercise.title}
Richtiges Ergebnis: ${exercise.correctAnswer} ${exercise.unit || ''}
Antwort des Schülers: ${studentAnswer}

AUFTRAG:
1. Verrate dem Schüler NIEMALS direkt das richtige Ergebnis!
2. Nutze die Sokratische Methode: Gib einen kurzen, verständnisvollen und motivierenden Denkanstoß (maximal 2-3 Sätze) auf Deutsch.
3. Beziehe wenn passend eine kleine Fußball-Metapher ein (z. B. "Passgenauigkeit", "Halbzeit", "Abwehrkette").
4. Formuliere eine gezielte Frage, die dem Schüler hilft, den Rechenschritt selbst zu korrigieren.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 150
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return {
              message: reply.trim(),
              isAi: true,
              type: 'hint'
            };
          }
        }
      } catch (err) {
        console.warn('Gemini API request failed, falling back to built-in tutor:', err);
      }
    }

    // Built-in intelligent offline Socratic Tutor
    return {
      message: `⚽ Trainer-Tipp: Schau dir die Aufgabe noch einmal in Ruhe an! ${exercise.hint}`,
      isAi: false,
      type: 'hint'
    };
  }

  // Praise message for correct answer
  public getPraiseMessage(): string {
    const praises = [
      '⚽ TOOOOR! Fantastisch gerechnet!',
      '🌟 Volltreffer genau in den Winkel!',
      '🔥 Meisterklasse! Dein Rechenpass kam millimetergenau an!',
      '🏆 Perfekt gelöst! Du spielst heute in der Champions League!',
      '👏 Stark gemacht! Das gibt wichtige Punkte für die Tabelle!'
    ];
    return praises[Math.floor(Math.random() * praises.length)];
  }

  // Native German Text-to-Speech (read question aloud)
  public speakGerman(text: string) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.95; // slightly slower for clear comprehension

      const voices = window.speechSynthesis.getVoices();
      const deVoice = voices.find(v => v.lang.startsWith('de'));
      if (deVoice) {
        utterance.voice = deVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const aiTutor = new AiTutorService();
