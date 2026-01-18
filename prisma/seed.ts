// Use a namespace import to resolve "no exported member" error when the Prisma client is not yet generated.
import * as Prisma from '@prisma/client';
import bcrypt from 'bcryptjs';

// Extract PrismaClient from the namespace using type casting to avoid compilation errors.
const { PrismaClient } = Prisma as any;
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('12345678', 10);

  // 1. Admin & Parent
  await prisma.user.upsert({
    where: { email: 'admin@techkids.bg' },
    update: {},
    create: { email: 'admin@techkids.bg', fullName: 'Админ ТехКидс', passwordHash, role: 'ADMIN' }
  });

  const parent = await prisma.user.upsert({
    where: { email: 'parent@test.com' },
    update: {},
    create: {
      email: 'parent@test.com',
      fullName: 'Симеон Петров',
      passwordHash,
      role: 'USER',
      children: {
        create: [
          { nickname: 'CyberHero', age: 11, ageBracket: '10-12' },
          { nickname: 'TechQueen', age: 14, ageBracket: '13-15' }
        ]
      }
    }
  });

  // 2. Comprehensive Curriculum (Level 1-10)
  const curriculum = [
    {
      order: 1,
      slug: 'intro-hardware',
      titleBG: 'Основи на компютърния хардуер',
      titleEN: 'Introduction to Computer Hardware',
      introBG: 'Добре дошли в света на хардуера! Тук ще разберем как отделните части работят заедно.',
      summaryBG: 'Компютърът е система от взаимосвързани компоненти (CPU, RAM, GPU), захранвани от PSU.',
      summaryEN: 'A computer is a system of interconnected components powered by the PSU.',
      contentSections: [
        { type: 'text', content: 'Всеки съвременен компютър се състои от няколко ключови части. Процесорът (CPU) е "мозъкът", RAM е "краткосрочната памет", а SSD/HDD е "дългосрочната памет".' },
        { type: 'info', content: 'GPU (видеокартата) отговаря за всичко, което виждаш на екрана, особено в игрите.' }
      ],
      keyTermsEN: [
        { term: 'Hardware', def: 'The physical parts of a computer system.' },
        { term: 'Component', def: 'A single part that makes up a larger system.' }
      ],
      mistakesBG: ['Мислиш, че мониторът е компютърът.'],
      sources: [
        { title: 'Intel Computing Basics', url: 'https://www.intel.com/content/www/us/en/gaming/resources/how-computers-work.html' },
        { title: 'Computer Hope: Hardware', url: 'https://www.computerhope.com/jargon/h/hardware.htm' }
      ]
    },
    {
      order: 2,
      slug: 'cpu-architecture',
      titleBG: 'Архитектура на процесора (CPU)',
      titleEN: 'CPU Architecture & Sockets',
      introBG: 'Процесорът изпълнява милиарди инструкции всяка секунда.',
      summaryBG: 'Ядрата и тактовата честота определят колко бързо се обработва информацията.',
      summaryEN: 'Cores and clock speed determine how fast information is processed.',
      contentSections: [
        { type: 'text', content: 'Процесорите използват сокети (sockets) за връзка с дънната платка. Intel използва LGA, докато по-старите AMD използваха PGA.' },
        { type: 'warning', content: 'Никога не натискай процесора със сила в сокета. Пиновете са изключително деликатни!' }
      ],
      keyTermsEN: [
        { term: 'Socket', def: 'The connector on the motherboard that holds the CPU.' },
        { term: 'Clock Speed', def: 'How many cycles a CPU performs per second, measured in GHz.' }
      ],
      mistakesBG: ['Опит за поставяне на Intel процесор в AMD дънна платка.'],
      sources: [
        { title: 'Intel ARK Reference', url: 'https://ark.intel.com' },
        { title: 'AMD Processors Guide', url: 'https://www.amd.com/en/products/processors' }
      ]
    },
    {
      order: 3,
      slug: 'gpu-power',
      titleBG: 'Видеокарти (GPU): Силата на графиката',
      titleEN: 'GPU: The Power of Graphics',
      introBG: 'Видеокартата не е само за игри; тя обработва сложни математически изчисления паралелно.',
      summaryBG: 'VRAM и архитектурата са ключови за производителността при висока резолюция.',
      summaryEN: 'VRAM and architecture are key for performance at high resolutions.',
      contentSections: [
        { type: 'text', content: 'NVIDIA и AMD са двата основни производителя на чипове. Ray Tracing е технология, която симулира реалното поведение на светлината.' }
      ],
      keyTermsEN: [
        { term: 'VRAM', def: 'Video Random Access Memory, used by the GPU to store textures.' },
        { term: 'Resolution', def: 'The number of pixels displayed on a screen.' }
      ],
      mistakesBG: ['Купуване на карта само заради количеството памет, без да се гледа чипът.'],
      sources: [
        { title: 'NVIDIA Ray Tracing Explainer', url: 'https://www.nvidia.com/en-us/geforce/news/rtx-ray-tracing-explained/' },
        { title: 'AMD Radeon Graphics', url: 'https://www.amd.com/en/graphics/radeon-rx-graphics' }
      ]
    },
    {
      order: 4,
      slug: 'ram-speed',
      titleBG: 'RAM Памет: Бързата работна площ',
      titleEN: 'RAM: The Fast Workspace',
      introBG: 'RAM е мястото, където компютърът държи активните програми.',
      summaryBG: 'Dual-channel режимът удвоява пропускателната способност на паметта.',
      summaryEN: 'Dual-channel mode doubles the memory bandwidth.',
      contentSections: [
        { type: 'text', content: 'DDR4 и DDR5 са текущите стандарти. Скоростта се измерва в MHz или MT/s.' }
      ],
      keyTermsEN: [
        { term: 'Bandwidth', def: 'The maximum rate of data transfer.' },
        { term: 'Latency', def: 'The delay before a transfer of data begins.' }
      ],
      mistakesBG: ['Поставяне на плочките памет в грешни слотове за dual-channel.'],
      sources: [
        { title: 'Crucial: What is RAM?', url: 'https://www.crucial.com/articles/about-memory-storage/what-is-ram' },
        { title: 'Kingston: DDR4 vs DDR5', url: 'https://www.kingston.com/en/blog/pc-performance/ddr5-vs-ddr4' }
      ]
    },
    {
      order: 5,
      slug: 'storage-speed',
      titleBG: 'Съхранение: HDD vs SSD',
      titleEN: 'Storage: HDD vs SSD Speed',
      introBG: 'Къде отиват твоите файлове, когато изключиш компютъра?',
      summaryBG: 'NVMe SSD дисковете са многократно по-бързи от традиционните HDD.',
      summaryEN: 'NVMe SSDs are many times faster than traditional HDDs.',
      contentSections: [
        { type: 'text', content: 'HDD използват въртящи се дискове, докато SSD използват флаш памет (NAND). NVMe е протокол, който използва PCIe шината.' }
      ],
      keyTermsEN: [
        { term: 'SSD', def: 'Solid State Drive, uses flash memory for fast storage.' },
        { term: 'NVMe', def: 'Non-Volatile Memory Express, a protocol for fast SSDs.' }
      ],
      mistakesBG: ['Използване на HDD за системно устройство в модерен компютър.'],
      sources: [
        { title: 'Samsung SSD Guides', url: 'https://www.samsung.com/semiconductor/minisite/ssd/support/faqs/' },
        { title: 'Western Digital: SSD vs HDD', url: 'https://www.westerndigital.com/solutions/ssd-vs-hdd' }
      ]
    },
    {
      order: 6,
      slug: 'motherboard-heart',
      titleBG: 'Дънни платки: Основата на всичко',
      titleEN: 'Motherboards: The Foundation',
      introBG: 'Дънната платка свързва всички компоненти и разпределя енергията.',
      summaryBG: 'Чипсетът и VRM модулите определят възможностите на системата.',
      summaryEN: 'The chipset and VRM modules determine the systems capabilities.',
      contentSections: [
        { type: 'text', content: 'Форм фактори като ATX, Micro-ATX и ITX определят размера на кутията, от която се нуждаеш.' }
      ],
      keyTermsEN: [
        { term: 'Chipset', def: 'The heart of the motherboard that controls component communication.' },
        { term: 'Form Factor', def: 'The physical size and layout of the motherboard.' }
      ],
      mistakesBG: ['Купуване на ITX платка за огромна кутия без нужда.'],
      sources: [
        { title: 'ASUS Motherboard Basics', url: 'https://www.asus.com/support/FAQ/1043007/' },
        { title: 'Gigabyte: Motherboard Guides', url: 'https://www.gigabyte.com/Support/FAQ' }
      ]
    },
    {
      order: 7,
      slug: 'psu-safety',
      titleBG: 'Захранване (PSU): Енергия и безопасност',
      titleEN: 'PSU: Power and Safety',
      introBG: 'Захранващият блок преобразува AC в DC за компонентите.',
      summaryBG: 'Ефективността 80 Plus не гарантира качество, но е важен показател.',
      summaryEN: '80 Plus efficiency does not guarantee quality, but it is an important indicator.',
      contentSections: [
        { type: 'warning', content: 'Никога не отваряй захранващия блок. Вътре има кондензатори с опасно високо напрежение!' }
      ],
      keyTermsEN: [
        { term: 'Efficiency', def: 'How much energy is converted vs lost as heat.' },
        { term: 'Wattage', def: 'The total power capacity of the PSU.' }
      ],
      mistakesBG: ['Спестяване от качествено захранване за сметка на други части.'],
      sources: [
        { title: 'Corsair PSU Guide', url: 'https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/' },
        { title: 'EVGA: Choosing a PSU', url: 'https://www.evga.com/support/faq/?f=59695' }
      ]
    },
    {
      order: 8,
      slug: 'cooling-theory',
      titleBG: 'Теория на охлаждането',
      titleEN: 'Cooling Theory & Airflow',
      introBG: 'Как пренасяме топлината далеч от важните части?',
      summaryBG: 'Въздушните охладители и AIO водните системи използват подобни принципи на топлообмен.',
      summaryEN: 'Air coolers and AIO water systems use similar heat exchange principles.',
      contentSections: [
        { type: 'text', content: 'Термо пастата запълва микроскопичните дупки между процесора и охладителя.' }
      ],
      keyTermsEN: [
        { term: 'Heatsink', def: 'A metal component that dissipates heat.' },
        { term: 'AIO', def: 'All-In-One liquid cooler.' }
      ],
      mistakesBG: ['Забравяне на предпазната лепенка под охладителя.'],
      sources: [
        { title: 'Noctua Cooling Manuals', url: 'https://noctua.at/en/installation-manuals' },
        { title: 'Arctic: Thermal Interface Basics', url: 'https://support.arctic.de/thermal-paste' }
      ]
    },
    {
      order: 9,
      slug: 'case-airflow',
      titleBG: 'Кутии и Въздушен поток',
      titleEN: 'Cases & Airflow Optimization',
      introBG: 'Въздушният поток определя колко дълго ще живее твоят хардуер.',
      summaryBG: 'Положителното и отрицателното налягане влияят на прахта в кутията.',
      summaryEN: 'Positive and negative pressure affect dust buildup in the case.',
      contentSections: [
        { type: 'info', content: 'Вентилаторите имат предна страна (всмукване) и задна страна с рамка (изхвърляне).' }
      ],
      keyTermsEN: [
        { term: 'Airflow', def: 'The movement of air through the computer case.' },
        { term: 'Dust Filter', def: 'A mesh screen that prevents dust from entering.' }
      ],
      mistakesBG: ['Всички вентилатори да духат навътре в кутията.'],
      sources: [
        { title: 'Cooler Master Airflow Guide', url: 'https://www.coolermaster.com/en-global/guides/' },
        { title: 'Lian Li: PC Case Optimization', url: 'https://lian-li.com/product-category/cases/' }
      ]
    },
    {
      order: 10,
      slug: 'diagnostics-basics',
      titleBG: 'Основи на хардуерната диагностика',
      titleEN: 'Hardware Diagnostics Basics',
      introBG: 'Компютърът не пали? Не се плаши, има логичен път за решаване.',
      summaryBG: 'POST е процесът, при който компютърът се проверява при стартиране.',
      summaryEN: 'POST is the process where the computer checks itself at startup.',
      contentSections: [
        { type: 'text', content: 'DEBUG LED светлините на дънната платка са най-добрият ти приятел при проблем.' }
      ],
      keyTermsEN: [
        { term: 'POST', def: 'Power-On Self-Test.' },
        { term: 'BIOS', def: 'Basic Input/Output System.' }
      ],
      mistakesBG: ['Паника преди да сте проверили дали кабелът е включен.'],
      sources: [
        { title: 'MSI Motherboard Troubleshooting', url: 'https://www.msi.com/support/technical_details/MB_Boot_No_Display' },
        { title: 'TechSpot: Hardware Debugging', url: 'https://www.techspot.com/guides/2325-pc-troubleshooting/' }
      ]
    }
  ];

  for (const l of curriculum) {
    const lesson = await prisma.lesson.upsert({
      where: { slug: l.slug },
      update: {},
      create: {
        ...l,
        contentSections: JSON.stringify(l.contentSections),
        keyTermsEN: JSON.stringify(l.keyTermsEN),
        mistakesBG: JSON.stringify(l.mistakesBG),
        sources: JSON.stringify(l.sources),
        published: true
      }
    });

    // 20 Questions per lesson = 200 total
    const questions = [];
    for (let i = 1; i <= 20; i++) {
      const type = i % 4 === 0 ? 'scenario' : (i % 3 === 0 ? 'multi' : 'single');
      questions.push({
        lessonId: lesson.id,
        textBG: `Сценарий за ${lesson.titleBG} #${i}: Ако имаш проблем с температурите, какво е най-добре да направиш?`,
        type,
        optionsBG: JSON.stringify(['Проверка на вентилаторите', 'Смяна на термо паста', 'Добавяне на още RAM', 'Рестарт на BIOS']),
        correctAnswer: type === 'multi' ? JSON.stringify([0, 1]) : JSON.stringify(0),
        explanationBG: `Защото температурите зависят от охлаждането (вентилатори и паста), а не от RAM.`,
        explanationSrc: JSON.parse(lesson.sources)[0].url
      });
    }
    await prisma.question.createMany({ data: questions });
  }

  console.log('Seed completed successfully. 10 lessons and 200 questions added.');
}

main().finally(() => prisma.$disconnect());