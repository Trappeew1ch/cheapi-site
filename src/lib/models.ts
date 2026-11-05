export type FamilyId = "gpt" | "claude" | "kimi" | "glm" | "deepseek";
export type ModelKind = "chat" | "image" | "audio" | "embedding";

export type Model = {
  id: string;
  name: string;
  family: FamilyId;
  vendor: string;
  coef: number;
  kind: ModelKind;
  tagline: string;
  description: string;
  bestFor: string[];
  skills: string[];
  badge?: string;
  aliases?: string[];
  featured?: boolean;
  apiOnly?: boolean;
  imageMinTokens?: number;
};

export const FAMILIES: Record<
  FamilyId,
  {
    id: FamilyId;
    name: string;
    vendor: string;
    accent: string;
    accentSoft: string;
    dot: string;
    description: string;
  }
> = {
  gpt: {
    id: "gpt",
    name: "GPT",
    vendor: "OpenAI",
    accent: "#0b1f16",
    accentSoft: "#e9f5ec",
    dot: "#12b76a",
    description:
      "Модели OpenAI для кода, агентов, работы с изображениями и транскрибации. Включая линейку GPT-6 и GPT-6.1.",
  },
  claude: {
    id: "claude",
    name: "Claude",
    vendor: "Anthropic",
    accent: "#7a3e1d",
    accentSoft: "#fff0e6",
    dot: "#ff8a4c",
    description:
      "Модели Anthropic с сильным кодом, длинными контекстами и аккуратной работой с текстом. Opus, Sonnet, Haiku и Fable.",
  },
  kimi: {
    id: "kimi",
    name: "Kimi",
    vendor: "Moonshot AI",
    accent: "#0f2b5b",
    accentSoft: "#e8f1ff",
    dot: "#1783ff",
    description:
      "Модели Moonshot AI с контекстом 1 млн токенов, сильным агентным кодом и зрением. K3.1 Pro — флагман линейки.",
  },
  glm: {
    id: "glm",
    name: "GLM",
    vendor: "Z.ai",
    accent: "#123a57",
    accentSoft: "#e7f3fd",
    dot: "#3b9ee8",
    description:
      "Модели Z.ai с открытой архитектурой: быстро, недорого и предсказуемо для массовых задач и агентных пайплайнов.",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    vendor: "DeepSeek",
    accent: "#064e2e",
    accentSoft: "#e2f8ed",
    dot: "#0f9d63",
    description:
      "Экономичные модели DeepSeek для рассуждений, кода и больших объёмов текста. Лучшая цена за миллион токенов.",
  },
};

export const IMAGE_MIN_TOKENS = 177_400;

export const MODELS: Model[] = [
  // ── OpenAI GPT ────────────────────────────────────────────────────────────
  {
    id: "gpt-6.1-sol",
    name: "GPT 6.1 Sol",
    family: "gpt",
    vendor: "OpenAI",
    coef: 4,
    kind: "chat",
    tagline: "Универсальный флагман для кода и агентов",
    description:
      "GPT 6.1 Sol — основная рабочая модель линейки GPT-6.1. Хорошо держит многошаговые задачи, уверенно пишет и рефакторит код, разбирается в больших файлах и подходит для агентных сценариев, где важна аккуратность вызовов инструментов. Если нужен один универсальный выбор без переплаты за топовую Astra, начните с Sol.",
    bestFor: [
      "Codex CLI и агентные пайплайны",
      "Рефакторинг и код-ревью",
      "Задачи с инструментами и длинным контекстом",
    ],
    skills: ["Код и отладка", "Вызов инструментов", "Анализ больших файлов", "Streaming"],
    badge: "Выбор редакции",
    featured: true,
  },
  {
    id: "gpt-6-astra",
    name: "GPT 6 Astra",
    family: "gpt",
    vendor: "OpenAI",
    coef: 11.25,
    kind: "chat",
    tagline: "Максимальная глубина для сложных задач",
    description:
      "Флагман GPT-6 для случаев, где цена ошибки выше цены токенов. Astra полезна в архитектурных решениях, многоэтапном планировании, разборе запутанных инцидентов и research-задачах, где нужно удержать в голове весь контекст. Это самая дорогая модель каталога — включайте её точечно, а рутину оставляйте Sol или Terra.",
    bestFor: [
      "Архитектура и сложные ревью",
      "Инциденты и глубокий анализ",
      "Исследования и планирование",
    ],
    skills: ["Глубокие рассуждения", "Длинный контекст", "Планирование", "Критичное качество"],
    badge: "Флагман",
    featured: true,
  },
  {
    id: "gpt-6.1-terra",
    name: "GPT 6.1 Terra",
    family: "gpt",
    vendor: "OpenAI",
    coef: 1.5,
    kind: "chat",
    tagline: "Рабочая лошадка на каждый день",
    description:
      "Terra закрывает повседневные задачи разработки: объяснить ошибку, написать тесты, разобрать чужой код, собрать документацию. Качество заметно выше экономных моделей, а цена остаётся предсказуемой. Хороший выбор по умолчанию для IDE и внутренних ассистентов.",
    bestFor: [
      "Ежедневная разработка",
      "Тесты и документация",
      "Внутренние ассистенты",
    ],
    skills: ["Генерация кода", "Объяснение ошибок", "Тесты", "Работа с документацией"],
    badge: "Баланс",
    featured: true,
  },
  {
    id: "gpt-6-luna",
    name: "GPT 6 Luna",
    family: "gpt",
    vendor: "OpenAI",
    coef: 0.8,
    kind: "chat",
    tagline: "Быстрая и недорогая для массовых запросов",
    description:
      "Luna создана для объёма: классификация, короткие ответы, извлечение данных, черновики и простые преобразования текста. Не стоит отдавать ей сложную логику, зато там, где важны скорость и цена, она отрабатывает предсказуемо.",
    bestFor: ["Массовая обработка текста", "Классификация и извлечение", "Черновики и короткие ответы"],
    skills: ["Высокая скорость", "Низкая цена", "Извлечение данных", "Пакетные задачи"],
    badge: "Экономная",
    featured: true,
  },
  {
    id: "gpt-6-sol",
    name: "GPT 6 Sol",
    family: "gpt",
    vendor: "OpenAI",
    coef: 3.8,
    kind: "chat",
    tagline: "Предыдущий флагман, всё ещё очень сильный",
    description:
      "GPT 6 Sol остаётся отличным выбором для сложного кода и агентов, если вы уже отладили промпты под это поколение. По цене он близок к GPT 6.1 Sol, поэтому сравнивайте на своих задачах: разница проявляется в деталях, а не в общем качестве.",
    bestFor: ["Агенты и инструменты", "Сложный код", "Задачи с большим контекстом"],
    skills: ["Код", "Инструменты", "Рассуждения", "Стабильные промпты"],
  },
  {
    id: "gpt-5.6-sol",
    name: "GPT 5.6 Sol",
    family: "gpt",
    vendor: "OpenAI",
    coef: 4.5,
    kind: "chat",
    tagline: "Проверенная модель для продакшена",
    description:
      "GPT 5.6 Sol — зрелая модель предыдущей линейки. Если у вас есть рабочие пайплайны и эталонные ответы под неё, переход не обязателен: API принимает тот же формат, а поведение остаётся стабильным от версии к версии.",
    bestFor: ["Продакшен-пайплайны", "Совместимость с легаси-промптами", "Код и анализ"],
    skills: ["Стабильное поведение", "Код", "Аналитика", "Инструменты"],
  },
  {
    id: "gpt-5.6-terra",
    name: "GPT 5.6 Terra",
    family: "gpt",
    vendor: "OpenAI",
    coef: 1.5,
    kind: "chat",
    tagline: "Сбалансированная модель прошлого поколения",
    description:
      "Terra 5.6 — спокойный универсал для редактуры, кода и разбора текста. Цена и поведение похожи на 6.1 Terra, поэтому брать её стоит, если нужна предсказуемость уже обкатанной версии.",
    bestFor: ["Редактура и тексты", "Повседневный код", "Ассистенты"],
    skills: ["Тексты", "Код", "Суммаризация", "Документация"],
  },
  {
    id: "gpt-5.6-luna",
    name: "GPT 5.6 Luna",
    family: "gpt",
    vendor: "OpenAI",
    coef: 0.9,
    kind: "chat",
    tagline: "Экономный вариант с хорошей скоростью",
    description:
      "Младшая модель линейки 5.6 для больших объёмов простых задач. Подходит для фоновых обработчиков, где ответ нужен быстро, а бюджет ограничен.",
    bestFor: ["Фоновые обработчики", "Простые ответы", "Пакетные задачи"],
    skills: ["Скорость", "Цена", "Стабильность", "Пакетная обработка"],
  },
  {
    id: "gpt-5.5",
    name: "GPT 5.5",
    family: "gpt",
    vendor: "OpenAI",
    coef: 4.5,
    kind: "chat",
    tagline: "Модель предыдущего поколения для сложных задач",
    description:
      "GPT 5.5 всё ещё востребована в проектах, где важна совместимость с уже написанными промптами и инструментами. Доступна по тому же ключу и в том же формате, что и новые модели.",
    bestFor: ["Совместимость", "Сложный анализ", "Агентные сценарии"],
    skills: ["Рассуждения", "Код", "Анализ", "Инструменты"],
  },
  {
    id: "gpt-4o-transcribe",
    name: "GPT-4o Transcribe",
    family: "gpt",
    vendor: "OpenAI",
    coef: 1,
    kind: "audio",
    tagline: "Транскрибация аудио по токенному тарифу",
    description:
      "Модель распознавания речи для расшифровки встреч, звонков и подкастов. Отправляйте аудиофайл через совместимый эндпоинт и получайте текст; стоимость списывается как обычные токены с коэффициентом 1.",
    bestFor: ["Расшифровка встреч", "Подкасты и интервью", "Субтитры"],
    skills: ["Speech-to-text", "Русский язык", "Длинные записи", "Пакетная обработка"],
    badge: "Аудио",
  },
  {
    id: "gpt-image-2.5-sunburst",
    name: "GPT Image 2.5 Sunburst",
    family: "gpt",
    vendor: "OpenAI",
    coef: 200,
    kind: "image",
    tagline: "Креативные изображения с яркой палитрой",
    description:
      "Модель генерации изображений с уклоном в выразительные цвета и художественные композиции. Подходит для обложек, рекламных макетов и концепт-арта. Оплата — по коэффициенту за выходные токены изображения.",
    bestFor: ["Обложки и баннеры", "Концепт-арт", "Рекламные макеты"],
    skills: ["Text-to-image", "Редактирование", "Высокое разрешение", "Стилизация"],
    badge: "Изображения",
    imageMinTokens: IMAGE_MIN_TOKENS,
  },
  {
    id: "gpt-image-2.5-flare",
    name: "GPT Image 2.5 Flare",
    family: "gpt",
    vendor: "OpenAI",
    coef: 200,
    kind: "image",
    tagline: "Чистые продуктовые и предметные кадры",
    description:
      "Вариант Sunburst с более сдержанной, «студийной» подачей. Хорошо держит продуктовые сцены, фактуры и свет. Используйте, когда нужна аккуратная картинка без визуального шума.",
    bestFor: ["Продуктовые визуалы", "Предметная съёмка", "Промо-графика"],
    skills: ["Text-to-image", "Студийный свет", "Фактуры", "Редактирование"],
    badge: "Изображения",
    imageMinTokens: IMAGE_MIN_TOKENS,
  },
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
    family: "gpt",
    vendor: "OpenAI",
    coef: 200,
    kind: "image",
    tagline: "Универсальная генерация и редактирование",
    description:
      "Рабочая модель для повседневной генерации картинок: иллюстрации, фоны, простые макеты. Поддерживает редактирование по описанию и хорошо следует промпту.",
    bestFor: ["Иллюстрации", "Фоны и текстуры", "Правки по промпту"],
    skills: ["Text-to-image", "Image editing", "Следование промпту", "Быстрая генерация"],
    badge: "Изображения",
    imageMinTokens: IMAGE_MIN_TOKENS,
  },
  {
    id: "gpt-image-1.5",
    name: "GPT Image 1.5",
    family: "gpt",
    vendor: "OpenAI",
    coef: 200,
    kind: "image",
    tagline: "Проверенная модель для стандартных задач",
    description:
      "Стабильная модель предыдущего поколения для генерации изображений. Если у вас уже настроены промпты и пайплайн под неё, можно продолжать пользоваться без изменений.",
    bestFor: ["Стандартная генерация", "Совместимость", "Массовые визуалы"],
    skills: ["Text-to-image", "Стабильность", "Пакетная генерация", "Редактирование"],
    badge: "Изображения",
    imageMinTokens: IMAGE_MIN_TOKENS,
  },

  // ── Claude ────────────────────────────────────────────────────────────────
  {
    id: "claude-opus-5-5",
    name: "Claude Opus 5.5",
    family: "claude",
    vendor: "Anthropic",
    coef: 20,
    kind: "chat",
    tagline: "Топовая модель Anthropic для самых сложных задач",
    description:
      "Opus 5.5 — максимум качества в линейке Claude: глубокие рассуждения, сложный код, длинные документы и аккуратная работа с неоднозначными инструкциями. Дорогая, поэтому держите её для архитектуры, критичных ревью и задач, где нужен лучший результат.",
    bestFor: ["Сложная архитектура", "Критичное код-ревью", "Длинные документы и анализ"],
    skills: ["Глубокие рассуждения", "Длинный контекст", "Код", "Работа с инструкциями"],
    badge: "Флагман",
    featured: true,
  },
  {
    id: "claude-fable-5-1",
    name: "Claude Fable 5.1",
    family: "claude",
    vendor: "Anthropic",
    coef: 20,
    kind: "chat",
    tagline: "Творческая модель с литературным голосом",
    description:
      "Fable 5.1 ориентирована на текст, повествование и редактуру: она лучше держит стиль, интонацию и структуру длинных материалов. Полезна для сценариев, лонгридов, бренд-текстов и работы с художественными задачами.",
    bestFor: ["Лонгриды и сценарии", "Бренд-тексты", "Редактура и стиль"],
    skills: ["Литературный текст", "Стиль и тон", "Длинные формы", "Редактура"],
    badge: "Творческая",
  },
  {
    id: "claude-opus-5",
    name: "Claude Opus 5",
    family: "claude",
    vendor: "Anthropic",
    coef: 12,
    kind: "chat",
    tagline: "Флагман предыдущего поколения",
    description:
      "Opus 5 — зрелая модель для сложных инженерных и аналитических задач. Часто выигрывает там, где важна предсказуемость и уже настроенные промпты, а разница с 5.5 не критична.",
    bestFor: ["Инженерия", "Аналитика", "Стабильные пайплайны"],
    skills: ["Рассуждения", "Код", "Длинный контекст", "Стабильность"],
  },
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    family: "claude",
    vendor: "Anthropic",
    coef: 12,
    kind: "chat",
    tagline: "Надёжная модель для сложного кода",
    description:
      "Opus 4.8 остаётся сильным выбором для рефакторинга, разбора инцидентов и больших кодовых баз. Если ваши пайплайны отлажены под неё, обновление не требуется.",
    bestFor: ["Большие кодовые базы", "Рефакторинг", "Разбор инцидентов"],
    skills: ["Код", "Анализ", "Инструменты", "Длинный контекст"],
  },
  {
    id: "claude-opus-4-7",
    name: "Claude Opus 4.7",
    family: "claude",
    vendor: "Anthropic",
    coef: 10,
    kind: "chat",
    tagline: "Сильный универсал прошлой линейки",
    description:
      "Opus 4.7 — проверенная модель для разработки и аналитики. Хорошо работает с инструментами и длинными инструкциями, доступна по тому же ключу без отдельной настройки.",
    bestFor: ["Разработка", "Агенты", "Аналитика"],
    skills: ["Код", "Агенты", "Анализ", "Инструкции"],
  },
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    family: "claude",
    vendor: "Anthropic",
    coef: 10,
    kind: "chat",
    tagline: "Стабильная модель для продакшена",
    description:
      "Opus 4.6 подходит командам, которые уже используют её в продакшене и не хотят менять поведение модели. Тот же API, тот же формат запросов.",
    bestFor: ["Продакшен", "Совместимость", "Код и тексты"],
    skills: ["Стабильность", "Код", "Тексты", "Анализ"],
  },
  {
    id: "claude-sonnet-5-5",
    name: "Claude Sonnet 5.5",
    family: "claude",
    vendor: "Anthropic",
    coef: 11,
    kind: "chat",
    tagline: "Флагманский баланс скорости и качества",
    description:
      "Sonnet 5.5 — самый практичный выбор в линейке Claude для повседневной разработки. Заметно быстрее Opus, при этом уверенно справляется с кодом, инструментами и длинными контекстами. Хорошая модель по умолчанию для Claude Code, если не нужен максимум Opus.",
    bestFor: ["Claude Code по умолчанию", "Повседневная разработка", "Агенты и инструменты"],
    skills: ["Скорость", "Код", "Инструменты", "Длинный контекст"],
    badge: "Баланс",
    featured: true,
  },
  {
    id: "claude-haiku-5-5",
    name: "Claude Haiku 5.5",
    family: "claude",
    vendor: "Anthropic",
    coef: 9,
    kind: "chat",
    tagline: "Быстрая модель для лёгких задач",
    description:
      "Haiku 5.5 отвечает быстро и стоит заметно меньше старших моделей. Подходит для классификации, коротких ответов, извлечения данных и фоновых операций в агентах.",
    bestFor: ["Классификация", "Фоновые операции", "Короткие ответы"],
    skills: ["Скорость", "Экономия", "Извлечение данных", "Агенты"],
    badge: "Быстрая",
  },
  {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    family: "claude",
    vendor: "Anthropic",
    coef: 5,
    kind: "chat",
    tagline: "Проверенный универсал по доступной цене",
    description:
      "Sonnet 5 — рабочая модель предыдущего поколения с хорошим качеством кода и текста. Часто это лучший компромисс, если бюджет ограничен, а задачи стандартные.",
    bestFor: ["Разработка", "Тексты", "Бюджетные пайплайны"],
    skills: ["Код", "Тексты", "Скорость", "Цена"],
    badge: "Выгодная",
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    family: "claude",
    vendor: "Anthropic",
    coef: 4,
    kind: "chat",
    tagline: "Самая доступная Claude для объёма",
    description:
      "Haiku 4.5 — экономный вариант для больших объёмов простых запросов. Хорошо подходит для сортировки, тегирования, коротких суммаризаций и фоновых задач.",
    bestFor: ["Сортировка и теги", "Суммаризация", "Большие объёмы"],
    skills: ["Цена", "Скорость", "Тегирование", "Суммаризация"],
  },
  {
    id: "claude-opus-4-5",
    name: "Claude Opus 4.5",
    family: "claude",
    vendor: "Anthropic",
    coef: 6,
    kind: "chat",
    tagline: "Доступный Opus прошлого поколения",
    description:
      "Opus 4.5 даёт качество старшей линейки по умеренной цене. Хороший вариант для сложных задач, если новые Opus избыточны по бюджету.",
    bestFor: ["Сложные задачи с бюджетом", "Код", "Анализ"],
    skills: ["Рассуждения", "Код", "Анализ", "Цена"],
  },

  // ── GLM ───────────────────────────────────────────────────────────────────
  {
    id: "glm-5.3",
    name: "Z.ai GLM-5.3",
    family: "glm",
    vendor: "Z.ai",
    coef: 1.5,
    kind: "chat",
    tagline: "Сильная открытая модель по цене экономной",
    description:
      "GLM-5.3 — флагман Z.ai для кода, текста и агентных сценариев. Даёт заметно больше качества, чем ожидаешь за эту цену, и хорошо ведёт себя в длинных диалогах. Популярный выбор для Cursor и внутренних ассистентов.",
    bestFor: ["Cursor и IDE", "Код и тексты", "Агентные пайплайны"],
    skills: ["Код", "Русский язык", "Инструменты", "Цена"],
    badge: "Выгодная",
    featured: true,
  },
  {
    id: "glm-5.2",
    name: "Z.ai GLM-5.2",
    family: "glm",
    vendor: "Z.ai",
    coef: 1.5,
    kind: "chat",
    tagline: "Стабильная версия для рабочих задач",
    description:
      "GLM-5.2 — предыдущая версия линейки с предсказуемым поведением. Подходит, если вы уже отладили промпты под неё и не хотите менять результаты.",
    bestFor: ["Стабильные пайплайны", "Тексты", "Код"],
    skills: ["Стабильность", "Код", "Тексты", "Цена"],
  },
  {
    id: "glm-5.3-flash",
    name: "Z.ai GLM-5.3 Flash",
    family: "glm",
    vendor: "Z.ai",
    coef: 1,
    kind: "chat",
    tagline: "Самая быстрая и дешёвая GLM",
    description:
      "Flash — облегчённая версия GLM-5.3 для массовых операций: короткие ответы, извлечение сущностей, классификация, черновики. Не требует больших бюджетов и хорошо масштабируется.",
    bestFor: ["Массовые запросы", "Извлечение данных", "Черновики"],
    skills: ["Скорость", "Цена", "Классификация", "Пакетная обработка"],
    badge: "Экономная",
  },
  {
    id: "glm-5.3-flash-abliterated",
    name: "GLM-5.3 Flash Abliterated",
    family: "glm",
    vendor: "Z.ai",
    coef: 5,
    kind: "chat",
    tagline: "Версия без встроенных отказов",
    description:
      "Abliterated-вариант GLM-5.3 Flash с ослабленными отказами. Предназначен для исследований, редактирования художественного текста и сценариев, где стандартные ограничения мешают. Ответственность за использование лежит на пользователе; правила сервиса по-прежнему действуют.",
    bestFor: ["Исследования", "Художественный текст", "Нестандартные сценарии"],
    skills: ["Без отказов", "Тексты", "Скорость", "Гибкость"],
    aliases: ["z-ai/glm-5.3-flash-abliterated"],
    badge: "Без фильтров",
  },

  // ── DeepSeek ──────────────────────────────────────────────────────────────
  {
    id: "deepseek-flash",
    name: "DeepSeek V4.1 Flash",
    family: "deepseek",
    vendor: "DeepSeek",
    coef: 0.3,
    kind: "chat",
    tagline: "Минимальная цена за миллион токенов",
    description:
      "DeepSeek V4.1 Flash — самый дешёвый способ получить адекватный текст и код. Идеальна для больших объёмов: обработка логов, генерация описаний, простые агенты, фоновые задачи. На сложных многошаговых сценариях уступает GPT и Claude, но по цене вне конкуренции.",
    bestFor: ["Большие объёмы", "Фоновая обработка", "Простые агенты"],
    skills: ["Самая низкая цена", "Скорость", "Русский язык", "Код"],
    badge: "Суперэконом",
    featured: true,
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    family: "deepseek",
    vendor: "DeepSeek",
    coef: 0.2,
    kind: "chat",
    tagline: "Ещё дешевле — для очень больших объёмов",
    description:
      "V4 Pro — самая доступная модель каталога. Берите её, когда важна не тонкость ответа, а стоимость обработки: массовая разметка, дедупликация, короткие ответы, извлечение полей.",
    bestFor: ["Массовая разметка", "Извлечение полей", "Огромные объёмы"],
    skills: ["Минимальная цена", "Пакетные задачи", "Извлечение данных", "Скорость"],
    badge: "Суперэконом",
  },
  {
    id: "deepseek-v4.1-flash-abliterated",
    name: "DeepSeek V4.1 Flash Abliterated",
    family: "deepseek",
    vendor: "DeepSeek",
    coef: 6,
    kind: "chat",
    tagline: "Экономная модель без встроенных отказов",
    description:
      "Abliterated-вариант DeepSeek V4.1 Flash для исследований и работы с текстом, где стандартные фильтры мешают. Стоимость выше обычного Flash из-за отдельного маршрута. Используйте в рамках закона и пользовательского соглашения.",
    bestFor: ["Исследования", "Редактура", "Нестандартные промпты"],
    skills: ["Без отказов", "Цена", "Тексты", "Гибкость"],
    aliases: ["deepseek/deepseek-v4.1-flash-abliterated"],
    badge: "Без фильтров",
  },

  // ── Kimi ──────────────────────────────────────────────────────────────────
  {
    id: "kimi-k3.1-pro",
    name: "Kimi K3.1 Pro",
    family: "kimi",
    vendor: "Moonshot AI",
    coef: 11,
    kind: "chat",
    tagline: "1M контекст, агентный код и зрение",
    description:
      "Kimi K3.1 Pro — флагман Moonshot AI с контекстом 1 048 576 токенов, сильным long-horizon кодированием, работой с изображениями и инструментами. Модель всегда включает рассуждение, поэтому хорошо подходит для больших репозиториев, агентных сессий и задач, где нужно удержать весь проект в контексте. Цена сопоставима с Claude Sonnet 5.5, но контекст в четыре раза больше.",
    bestFor: [
      "Большие репозитории и long-horizon код",
      "Агентные пайплайны с инструментами",
      "Документы и изображения в одном контексте",
    ],
    skills: ["1M контекст", "Код и агенты", "Vision", "Reasoning"],
    badge: "Новинка",
    aliases: ["moonshotai/kimi-k3.1-pro", "kimi-k3-1-pro"],
    featured: true,
  },

  // ── Embeddings ────────────────────────────────────────────────────────────
  {
    id: "text-embedding-v4",
    name: "Qwen Text Embedding V4",
    family: "glm",
    vendor: "Qwen",
    coef: 1,
    kind: "embedding",
    tagline: "Эмбеддинги для поиска и RAG",
    description:
      "Модель векторных представлений для семантического поиска, кластеризации и RAG-пайплайнов. Работает через стандартный эндпоинт /v1/embeddings и оплачивается как обычные токены с коэффициентом 1.",
    bestFor: ["RAG и поиск", "Кластеризация", "Семантические индексы"],
    skills: ["Embeddings", "Мультиязычность", "RAG", "Поиск"],
    badge: "Embeddings",
  },
];

export const MODEL_MAP = new Map(MODELS.map((m) => [m.id, m]));

/** Resolve a model id coming from the API, including aliases and version suffixes. */
export function resolveModel(requested: string): Model | undefined {
  const raw = requested.trim();
  const normalized = raw.replace(/^zai-/, "");
  const exact = MODEL_MAP.get(normalized);
  if (exact) return exact;

  for (const model of MODELS) {
    if (model.aliases?.includes(normalized)) return model;
  }

  // Versioned ids (gpt-6.1-sol-2026-01-01, claude-opus-5-5@2026-01-01, etc.)
  const candidates = [...MODELS].sort((a, b) => b.id.length - a.id.length);
  for (const model of candidates) {
    if (model.aliases?.some((alias) => normalized.startsWith(`${alias}-`))) {
      return model;
    }
    if (
      normalized.startsWith(`${model.id}-`) ||
      normalized.startsWith(`${model.id}:`) ||
      normalized.startsWith(`${model.id}@`)
    ) {
      return model;
    }
  }

  return undefined;
}

export const PUBLIC_MODELS = MODELS.filter((m) => !m.apiOnly);

export const FEATURED_MODELS = MODELS.filter((m) => m.featured);

export const MODEL_COUNT = PUBLIC_MODELS.length;

export function modelsByFamily(family: FamilyId) {
  return MODELS.filter((m) => m.family === family);
}

export function relatedModels(model: Model, limit = 3) {
  const sameFamily = MODELS.filter(
    (m) => m.id !== model.id && m.family === model.family && m.kind === model.kind,
  ).sort((a, b) => Math.abs(a.coef - model.coef) - Math.abs(b.coef - model.coef));
  const fallback = MODELS.filter(
    (m) => m.id !== model.id && !sameFamily.some((s) => s.id === m.id),
  );
  return [...sameFamily, ...fallback].slice(0, limit);
}

export function modelPath(id: string) {
  return `/models/${id}`;
}
