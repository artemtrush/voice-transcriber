const { z } = require('zod');

const ANALYSIS_PROMPT = `
Ти — професійний редактор.
Твоє завдання — придумати лаконічну та влучну назву для голосової нотатки на основі її транскрипції.

**Інструкції:**
- Назва має відображати основну суть нотатки.
- Мова: українська.

**Формат виводу:**
Ти повертаєш ТІЛЬКИ валідний JSON об'єкт.
`;

const ANALYSIS_SCHEMA = z.object({
  title: z.string(),
});

module.exports = { ANALYSIS_PROMPT, ANALYSIS_SCHEMA };
