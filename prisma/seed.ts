
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data from original tier files
const TIER1_QUESTIONS = [
  {
    text: "Защо при монтаж на LGA процесор не трябва да се докосват контактните повърхности с пръсти?",
    options: ["Мазнината от кожата оксидира златното покритие и влошава проводимостта.", "Пръстите могат да прехвърлят статично електричество и да огънат фините пинове.", "Влагата от ръцете създава микроскопични къси съединения при старт."],
    correct: 2,
    explanation: "Мазнината пречи на контакта, а ESD убива веригите.",
    fact: "Чистотата е здраве за хардуера."
  },
  {
    text: "Кой компонент съхранява BIOS/UEFI настройките, когато компютърът е изключен от тока?",
    options: ["Батерията CR2032 захранва CMOS чипа с енергонезависима памет.", "Настройките се записват директно в кеш паметта на процесора.", "Кондензаторите на дънната платка задържат заряд за данните."],
    correct: 0,
    explanation: "CMOS паметта се нуждае от малко напрежение, за да помни часа и настройките.",
    fact: "Ако компютърът ти губи времето, смени батерията на дъното."
  },
  {
    text: "Каква е основната разлика между HDD и SSD?",
    options: ["SSD няма движещи се части и използва флаш памет за съхранение.", "HDD е по-бърз при четене, защото магнитният диск се върти постоянно.", "SSD устройствата са съвместими само с лаптопи и мобилни телефони."],
    correct: 0,
    explanation: "Липсата на механика прави SSD-тата стотици пъти по-бързи и устойчиви на удари.",
    fact: "Времето за достъп при SSD е близо до нулата."
  },
  {
    text: "За какво служи термопастата?",
    options: ["Запълва микроскопичните дупки и неравности между процесора и охладителя.", "Служи като лепило, за да държи охладителя здраво закрепен за цокъла.", "Охлажда процесора директно чрез химическа ендотермична реакция."],
    correct: 0,
    explanation: "Въздухът е лош проводник. Пастата пренася топлината от метала към метала.",
    fact: "Твърде много паста е почти толкова лошо, колкото твърде малко."
  },
  {
    text: "Какво означава съкращението GPU?",
    options: ["Graphics Processing Unit", "General Power Utility", "Global Processing Unit"],
    correct: 0,
    explanation: "GPU е специализиран процесор за обработка на графика и паралелни изчисления.",
    fact: "Първият GPU в света е GeForce 256 на NVIDIA."
  },
  {
    text: "Какво е 'Pixel'?",
    options: ["Най-малката точка от цифровото изображение на екрана.", "Специален вид процесор за мобилни телефони.", "Мерна единица за скорост на интернет връзката."],
    correct: 0,
    explanation: "Думата идва от 'Picture Element'. Милиони пиксели образуват картината.",
    fact: "4K резолюцията съдържа над 8 милиона пиксела."
  }
];

const TIER2_QUESTIONS = [
  {
    text: "При DDR5, защо е по-добре да използваш 2 плочки RAM вместо 4 при високи честоти?",
    options: ["Натоварва контролера (IMC) и влошава сигналната интегритетност.", "Защото две плочки консумират по-малко ток и греят по-малко.", "Защото четири плочки физически не се събират под охладителя."],
    correct: 0,
    explanation: "1DPC (1 Dimm Per Channel) е стандартът за стабилен овърклок.",
    fact: "Повечето рекорди за RAM се правят с една плочка на дъно с два слота."
  },
  {
    text: "Каква е ролята на VRM (Voltage Regulator Module) върху дънната платка?",
    options: ["Преобразува 12V от захранването в прецизно ниско напрежение за процесора.", "Управлява адресируемите RGB светлини на вентилаторите.", "Осигурява директна връзка между видеокартата и монитора."],
    correct: 0,
    explanation: "Процесорите работят на около 1.2V-1.4V. VRM фазите трябва да са стабилни, за да няма сривове.",
    fact: "Прегрял VRM е най-честата причина за тротлинг (сваляне на честота)."
  },
  {
    text: "Защо L3 кешът е толкова важен за производителността в игрите?",
    options: ["Намалява латентността, като държи важни данни близо до ядрата.", "Увеличава резолюцията на текстурите в играта автоматично.", "Позволява на хард диска да зарежда нивата по-бързо."],
    correct: 0,
    explanation: "Кешът е свръхбърза памет вътре в чипа. Повече кеш = по-гладък геймплей (FPS).",
    fact: "Процесорите AMD X3D използват 3D V-Cache за огромно предимство в игрите."
  },
  {
    text: "Какво е DLSS (Deep Learning Super Sampling)?",
    options: ["AI технология, която рендира на ниска резолюция и увеличава качеството чрез изкуствен интелект.", "Нов вид монитор с по-висока честота на опресняване.", "Технология за подобряване на качеството на звука в слушалките."],
    correct: 0,
    explanation: "Това позволява много повече FPS без видима загуба на качество.",
    fact: "DLSS използва Tensor ядрата в RTX картите."
  }
];

const TIER3_QUESTIONS = [
  {
    text: "Какво е 'ECC Multi-bit Error' и защо е фатален за сървъра?",
    options: ["Повредени са повече битове, отколкото алгоритъмът може да поправи.", "Когато RAM паметта прегрее над 100 градуса и стопи слота.", "Когато захранването прекъсне за части от секундата."],
    correct: 0,
    explanation: "ECC поправя 1 бит грешка, но при 2+ бита системата прави Panic Stop, за да не корумпира базата данни.",
    fact: "Сървърите използват регистрова памет (RDIMM) за по-голяма стабилност."
  },
  {
    text: "Защо във водните охлаждания не се смесват алуминиеви и медни блокове?",
    options: ["Заради галванична корозия, която разяжда по-слабия метал.", "Защото течността става твърде гъста и запушва помпата.", "Защото алуминият е по-тежък и огъва дънната платка."],
    correct: 0,
    explanation: "Двата метала в една течност образуват батерия. По-слабият метал започва да се разпада.",
    fact: "Винаги проверявайте материалите на фитингите и радиаторите!"
  },
  {
    text: "Каква е целта на RAID 0 конфигурацията при дисковете?",
    options: ["Удвоява скоростта чрез разпределяне на данните, но без защита.", "Осигурява пълно резервно копие на данните при повреда.", "Намалява значително шума от въртенето на дисковете."],
    correct: 0,
    explanation: "RAID 0 пише на два диска едновременно. Ако единият изгори - всичко изчезва.",
    fact: "Никога не дръж важни файлове на RAID 0 без външен архив!"
  },
  {
    text: "Какво е 'Docker'?",
    options: ["Платформа за стартиране на приложения в изолирани контейнери.", "Популярна марка панталони за програмисти.", "Пристанище за свързване на кораби с интернет."],
    correct: 0,
    explanation: "Контейнерите са по-леки от виртуалните машини и стартират за секунди.",
    fact: "Docker промени начина, по който се разработва софтуер в целия свят."
  }
];

const TIER0_QUESTIONS = [
  {
    text: "При транзистори под 2nm, как 'Quantum Tunneling' влияе на логическата нула?",
    options: ["Електроните преминават през бариерата въпреки липсата на напрежение.", "Процесорът спира да консумира ток и влиза в хибернация.", "Транзисторът се изпарява моментално от топлината."],
    correct: 0,
    explanation: "Електроните са толкова малки, че преминават през стените на транзистора, което прави 'изключването' му невъзможно.",
    fact: "Това е лимитът на модерната физика на чиповете."
  },
  {
    text: "При Von Neumann архитектурата, какво представлява 'Bottleneck' ефектът?",
    options: ["Ограничението на скоростта на трансфер между паметта и процесора.", "Когато захранващият кабел е твърде тънък за мощността.", "Когато охладителят е монтиран наобратно и спира въздуха."],
    correct: 0,
    explanation: "Процесорът чака данните от паметта твърде дълго, което губи изчислителни цикли.",
    fact: "Затова кеш паметта (L1, L2, L3) е толкова критична."
  }
];

async function main() {
  // 1. Create Learning Modules
  const curriculum = [
    {
      order: 1,
      slug: 'intro-hardware',
      titleBG: 'Основи на хардуера',
      titleEN: 'Hardware Basics',
      summaryBG: 'Какво има в кутията? CPU, RAM, GPU и други зверове.',
      summaryEN: 'What is inside the box? CPU, RAM, GPU and other beasts.',
      contentSections: [
        { type: 'text', content: 'Всеки съвременен компютър се състои от няколко ключови части. Процесорът (CPU) е "мозъкът", RAM е "краткосрочната памет", а SSD/HDD е "дългосрочната памет".' },
        { type: 'info', content: 'GPU (видеокартата) отговаря за всичко, което виждаш на екрана, особено в игрите.' }
      ],
      keyTermsEN: [{ term: 'Hardware', def: 'Physical parts' }],
      mistakesBG: ['Мониторът не е компютърът!'],
      sources: [{ title: 'Intel Basics', url: 'https://intel.com' }]
    },
    {
      order: 2,
      slug: 'cpu-architecture',
      titleBG: 'Процесори (CPU)',
      titleEN: 'CPU Architecture',
      summaryBG: 'Ядра, нишки и гигахерци. Как мисли компютърът.',
      summaryEN: 'Cores, threads and gigahertz.',
      contentSections: [
        { type: 'text', content: 'Процесорите използват сокети за връзка с дънната платка.' },
        { type: 'warning', content: 'Пиновете са много чупливи!' }
      ],
      keyTermsEN: [{ term: 'Socket', def: 'CPU connector' }],
      mistakesBG: ['Насилване на процесора в сокета.'],
      sources: [{ title: 'AMD Docs', url: 'https://amd.com' }]
    },
    {
      order: 3,
      slug: 'exam-rookie',
      titleBG: 'ИЗПИТ: AORUS Rookie',
      titleEN: 'Exam: Rookie Tier',
      summaryBG: 'Тест за начинаещи. Докажи, че не си noob.',
      summaryEN: 'Beginner test.',
      contentSections: [
        { type: 'text', content: 'Това е първият голям тест. Включва въпроси от обща култура за хардуера.' }
      ],
      keyTermsEN: [],
      mistakesBG: [],
      sources: []
    },
    {
      order: 4,
      slug: 'exam-elite',
      titleBG: 'ИЗПИТ: AORUS Elite',
      titleEN: 'Exam: Elite Tier',
      summaryBG: 'Сериозни въпроси за овърклок и архитектура.',
      summaryEN: 'Overclocking and architecture.',
      contentSections: [{ type: 'text', content: 'Тук нещата стават сериозни. Внимавай с волтажите.' }],
      keyTermsEN: [],
      mistakesBG: [],
      sources: []
    },
    {
      order: 5,
      slug: 'exam-xtreme',
      titleBG: 'ИЗПИТ: AORUS Xtreme',
      titleEN: 'Exam: Xtreme Tier',
      summaryBG: 'Сървъри, мрежи и екстремен хардуер.',
      summaryEN: 'Servers and extreme hardware.',
      contentSections: [{ type: 'text', content: 'Само за истински експерти.' }],
      keyTermsEN: [],
      mistakesBG: [],
      sources: []
    },
    {
      order: 6,
      slug: 'exam-singularity',
      titleBG: 'НИВО: СИНГУЛЯРНОСТ',
      titleEN: 'Tier: Singularity',
      summaryBG: 'Квантова физика и лимита на силиция.',
      summaryEN: 'Quantum physics.',
      contentSections: [{ type: 'warning', content: 'Опасност от прегряване на мозъка.' }],
      keyTermsEN: [],
      mistakesBG: [],
      sources: []
    }
  ];

  for (const l of curriculum) {
    const lesson = await prisma.lesson.upsert({
      where: { slug: l.slug },
      update: {},
      create: {
        order: l.order,
        slug: l.slug,
        titleBG: l.titleBG,
        titleEN: l.titleEN,
        summaryBG: l.summaryBG,
        summaryEN: l.summaryEN,
        contentSections: l.contentSections as any,
        keyTermsEN: l.keyTermsEN as any,
        mistakesBG: l.mistakesBG as any,
        sources: l.sources as any,
      }
    });

    // Clean existing questions to prevent duplicates on re-seed
    await prisma.question.deleteMany({ where: { lessonId: lesson.id } });

    let questionsToAdd: any[] = [];

    if (l.slug === 'exam-rookie') questionsToAdd = TIER1_QUESTIONS;
    else if (l.slug === 'exam-elite') questionsToAdd = TIER2_QUESTIONS;
    else if (l.slug === 'exam-xtreme') questionsToAdd = TIER3_QUESTIONS;
    else if (l.slug === 'exam-singularity') questionsToAdd = TIER0_QUESTIONS;
    else {
      // Add generic questions for standard lessons
      questionsToAdd = [
        {
          text: `Въпрос за ${l.titleBG}: Какво е най-важно?`,
          options: ["Да свети RGB", "Да работи стабилно", "Да е скъпо"],
          correct: 1,
          explanation: "Стабилността е преди всичко.",
          fact: "RGB не вдига FPS."
        }
      ];
    }

    for (const q of questionsToAdd) {
      await prisma.question.create({
        data: {
          lessonId: lesson.id,
          textBG: q.text,
          optionsBG: q.options,
          correctIdx: q.correct,
          explanationBG: q.explanation,
          factBG: q.fact || null
        }
      });
    }
  }

  console.log('Seed completed.');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
