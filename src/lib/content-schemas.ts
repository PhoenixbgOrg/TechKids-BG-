import { BG } from './i18n';

export type SectionType = 'text' | 'info' | 'warning';

export interface LessonSection {
  type: SectionType;
  content: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface KeyTerm {
  term: string;
  def: string;
}

export function validateLessonForPublish(lesson: any) {
  const errors: string[] = [];

  if (!lesson.sources || lesson.sources.length < 2) {
    errors.push("Урокът трябва да има поне 2 официални източника.");
  }

  if (!lesson.contentSections || lesson.contentSections.length === 0) {
    errors.push("Урокът не съдържа секции с текст.");
  }

  if (!lesson.titleEN || !lesson.summaryEN) {
    errors.push("Липсва английският слой (заглавие или обобщение).");
  }

  return {
    success: errors.length === 0,
    errors
  };
}

export function validateQuestion(question: any) {
  const errors: string[] = [];

  if (!question.explanationBG) errors.push("Липсва обяснение на верния отговор.");
  if (!question.explanationSrc) errors.push("Липсва източник за обяснението.");

  return {
    success: errors.length === 0,
    errors
  };
}