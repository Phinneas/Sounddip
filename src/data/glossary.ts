// Sound Dip glossary. One page (/glossary/), one anchor per term.
//
// Linking rule (CP7): every entry links to at least one strong internal page
// that covers the term in depth. Terms with no strong internal page link to an
// outside source instead, verified 2026-11-06. See the CP7 link map comment
// in Asana for how each page was scored.

export interface GlossaryLink {
  label: string;
  href: string;
}

export interface GlossaryEntry {
  slug: string;
  term: string;
  group: GlossaryGroup;
  /** One quotable sentence. Shown first and used as the schema description. */
  definition: string;
  /** 40 to 80 words of context. */
  context: string;
  readMore?: GlossaryLink[];
  findOne?: GlossaryLink[];
  source?: GlossaryLink;
}

export type GlossaryGroup =
  | 'Formats'
  | 'Instruments'
  | 'Sound and the body'
  | 'Practice and credentials'
  | 'Safety'
  | 'Related practices';

export const glossaryGroups: { name: GlossaryGroup; slug: string }[] = [
  { name: 'Formats', slug: 'formats' },
  { name: 'Instruments', slug: 'instruments' },
  { name: 'Sound and the body', slug: 'sound-and-the-body' },
  { name: 'Practice and credentials', slug: 'practice-and-credentials' },
  { name: 'Safety', slug: 'safety' },
  { name: 'Related practices', slug: 'related-practices' },
];

export const glossary: GlossaryEntry[] = [
  // ── Formats ────────────────────────────────────────────────────────────
  {
    slug: 'sound-bath',
    term: 'Sound bath',
    group: 'Formats',
    definition:
      'A sound bath is a session where you lie down and listen while a practitioner plays sustained-tone instruments like singing bowls, gongs, and chimes, usually for 45 to 90 minutes.',
    context:
      'There is no movement, chanting, or skill involved. You just listen. Sound bath is the bookable event format that sits inside the broader sound healing category. It is what most people mean when they say they want to try sound healing for the first time. Sessions can be public group classes, private bookings, or outdoor community events.',
    readMore: [
      { label: 'What is a sound bath?', href: '/blog/what-is-a-sound-bath/' },
      { label: 'Your first sound bath', href: '/guide/first-time/' },
      { label: 'What happens during a sound bath', href: '/blog/what-happens-during-a-sound-bath/' },
    ],
    findOne: [{ label: 'Browse all cities', href: '/cities/' }],
  },
  {
    slug: 'gong-bath',
    term: 'Gong bath',
    group: 'Formats',
    definition:
      'A gong bath is a sound bath led mainly with one or more large gongs, producing deep vibration you feel in your body as much as you hear.',
    context:
      'Gongs carry more volume and a wider dynamic range than bowls. Practitioners build waves of intensity, from near silence to a full wall of sound, then bring it back down. That continuous build is called a gong wash. Gong baths suit people who want a strong, physical experience. They are not the gentlest starting point if you are sound-sensitive.',
    readMore: [
      { label: 'Gong bath vs. sound bath', href: '/blog/gong-bath-vs-sound-bath/' },
      { label: 'Every type of sound bath, explained', href: '/blog/every-type-of-sound-bath-explained/' },
    ],
    findOne: [
      { label: 'Boulder', href: '/cities/boulder/' },
      { label: 'Portland', href: '/cities/portland/' },
      { label: 'Asheville', href: '/cities/asheville/' },
    ],
  },
  {
    slug: 'floating-sound-bath',
    term: 'Floating sound bath',
    group: 'Formats',
    definition:
      'A floating sound bath is a sound bath you experience suspended, either in a heated pool, an aerial hammock, or a float tank, while instruments play nearby.',
    context:
      'The water or hammock holds you still, so your body does less work and the vibration registers differently. Floating sessions are common at spas and wellness resorts. They usually run about 60 minutes and cost more than a standard group class because of the extra logistics. Check pool depth, temperature, and what to wear before you book.',
    readMore: [
      { label: 'Floating sound bath guide', href: '/blog/floating-sound-bath/' },
      { label: 'Every type of sound bath, explained', href: '/blog/every-type-of-sound-bath-explained/' },
    ],
    findOne: [
      { label: 'Washington, DC', href: '/cities/washington-dc/' },
      { label: 'San Diego', href: '/cities/san-diego/' },
      { label: 'Miami', href: '/cities/miami/' },
    ],
  },
  {
    slug: 'private-sound-bath',
    term: 'Private sound bath',
    group: 'Formats',
    definition:
      'A private sound bath is a session delivered to one person or a small group, where the practitioner tailors instruments, pacing, and intensity to you.',
    context:
      'Any format can be private, from crystal bowls to gongs. Practitioners can slow down, skip loud instruments, or add more time at the end. Private sessions cost considerably more than group classes, typically $100 to $300. They suit people managing anxiety or grief, couples, and anyone who wants a session in their own home or space.',
    readMore: [
      { label: 'Private sound bath guide', href: '/blog/private-sound-bath/' },
      { label: 'How much does a sound bath cost?', href: '/blog/how-much-does-a-sound-bath-cost/' },
    ],
    findOne: [
      { label: 'Los Angeles', href: '/cities/los-angeles/' },
      { label: 'Austin', href: '/cities/austin/' },
    ],
  },
  {
    slug: 'outdoor-sound-bath',
    term: 'Outdoor sound bath',
    group: 'Formats',
    definition:
      'An outdoor sound bath takes a standard format, usually gong or crystal bowl, out of the studio and into a park, garden, beach, or rooftop.',
    context:
      'The appeal is layering wind, birds, and distant traffic into the session instead of shutting them out. Outdoor sessions are often seasonal and priced close to a standard group class. Some community events are free. They suit people who find indoor group rooms too closed-in.',
    readMore: [{ label: 'Every type of sound bath, explained', href: '/blog/every-type-of-sound-bath-explained/' }],
    findOne: [
      { label: 'Boston', href: '/cities/boston/' },
      { label: 'Joshua Tree', href: '/cities/joshua-tree/' },
    ],
  },
  {
    slug: 'corporate-sound-bath',
    term: 'Corporate sound bath',
    group: 'Formats',
    definition:
      'A corporate sound bath is a shortened session, often 20 to 30 minutes, booked by an employer for a wellness day, offsite, or team event.',
    context:
      'Practitioners scale the setup down to fit a conference room or open office. Pricing is per session rather than per person, typically $150 to $500 or more depending on group size and location. If you are booking one, ask how the practitioner handles a room where people are seated rather than lying down.',
    readMore: [
      { label: 'Every type of sound bath, explained', href: '/blog/every-type-of-sound-bath-explained/' },
      { label: 'Private sound bath guide', href: '/blog/private-sound-bath/' },
    ],
  },
  {
    slug: 'full-moon-sound-bath',
    term: 'Full moon sound bath',
    group: 'Formats',
    definition:
      'A full moon sound bath is a session timed to the full moon, usually with lunar or intention-setting themes added to a standard bowl or gong format.',
    context:
      'The timing is ceremonial. Nothing about the moon changes how the instruments sound. There is research on the moon and sleep, though. A 2021 study in Science Advances found people went to bed later and slept less in the nights before a full moon. Full moon sessions are common in the directory and often sell out early.',
    source: {
      label: 'University of Washington on Casiraghi et al., Science Advances (2021)',
      href: 'https://magazine.washington.edu/feature/we-sleep-less-when-a-full-moon-is-near-research-shows',
    },
    findOne: [
      { label: 'Austin', href: '/cities/austin/' },
      { label: 'Asheville', href: '/cities/asheville/' },
      { label: 'Boulder', href: '/cities/boulder/' },
    ],
  },
  {
    slug: 'cacao-ceremony',
    term: 'Cacao ceremony',
    group: 'Formats',
    definition:
      'A cacao ceremony is a gathering built around drinking a warm, unsweetened cacao drink, often paired with a sound bath, breathwork, or intention setting.',
    context:
      'Ritual cacao drinking has deep roots in Mesoamerica. Chemical traces in pottery show it reached Chaco Canyon in New Mexico around A.D. 1000 to 1125. Modern sessions adapt the idea for wellness settings. Cacao contains theobromine and some caffeine, so ask about the dose if you are sensitive to stimulants.',
    source: {
      label: 'Crown and Hurst, PNAS (2009)',
      href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2650116',
    },
    findOne: [
      { label: 'Los Angeles', href: '/cities/los-angeles/' },
      { label: 'San Francisco', href: '/cities/san-francisco/' },
    ],
  },
  {
    slug: 'live-vs-recorded',
    term: 'Live vs. recorded sound bath',
    group: 'Formats',
    definition:
      'A live sound bath is a session in a room with real instruments, while a recorded sound bath is an audio track of those instruments played through speakers or headphones.',
    context:
      'A recording can be great for relaxation, sleep, or background. What it cannot do is vibrate through the floor or adapt to the room. A live practitioner reads the group and decides what to play and for how long. That physical presence and responsiveness is why many people report a bigger effect from live sessions.',
    readMore: [
      { label: 'Sound bath music', href: '/blog/sound-bath-music/' },
      { label: 'Sound bath for sleep', href: '/blog/sound-bath-for-sleep/' },
    ],
  },

  // ── Instruments ────────────────────────────────────────────────────────
  {
    slug: 'singing-bowl',
    term: 'Singing bowl',
    group: 'Instruments',
    definition:
      'A singing bowl is a bowl-shaped instrument that rings with a sustained tone when struck or when a mallet is circled around its rim.',
    context:
      'Singing bowls come in two main families: metal bowls, often called Tibetan or Himalayan, and quartz crystal bowls. They are the most common instrument in American sound baths. Bowls are low-risk for most people. The real hearing risk only comes from a metal bowl struck hard and held close to your ear for a long time.',
    readMore: [
      { label: 'Crystal vs. Tibetan singing bowls', href: '/blog/crystal-vs-tibetan-singing-bowls/' },
      { label: 'Singing bowl safety', href: '/blog/sound-bath-negative-effects/' },
    ],
  },
  {
    slug: 'crystal-singing-bowl',
    term: 'Crystal singing bowl',
    group: 'Instruments',
    definition:
      'A crystal singing bowl is a quartz bowl, cast from fused quartz sand or cut from solid quartz, that produces a clear, bright, sustained tone.',
    context:
      'Crystal bowls are a late 20th-century invention with no ancient tradition behind them. Manufacturing is precise, so each bowl is tuned to a note and sounds consistent from one bowl to the next. Practitioners layer several at once. Crystal bowl sessions tend to feel brighter and more meditative than gong-heavy formats.',
    readMore: [
      { label: 'Crystal vs. Tibetan singing bowls', href: '/blog/crystal-vs-tibetan-singing-bowls/' },
      { label: 'Every type of sound bath, explained', href: '/blog/every-type-of-sound-bath-explained/' },
    ],
    findOne: [
      { label: 'New York City', href: '/cities/new-york/' },
      { label: 'Los Angeles', href: '/cities/los-angeles/' },
      { label: 'Sedona', href: '/cities/sedona/' },
    ],
  },
  {
    slug: 'tibetan-singing-bowl',
    term: 'Tibetan (Himalayan) singing bowl',
    group: 'Instruments',
    definition:
      'A Tibetan or Himalayan singing bowl is a metal bowl, usually a copper and tin alloy, that produces a warm, textured tone with layered overtones.',
    context:
      'Many are still hand-hammered in Nepal and northern India, so no two sound exactly alike. Older bowls were used for cooking, offerings, and ritual long before Western sound healing. Practitioners often rest them on or near the body during part of a session. Bowls sold as "antique Tibetan" are frequently mass-produced, so ask where yours came from if it matters to you.',
    readMore: [
      { label: 'Crystal vs. Tibetan singing bowls', href: '/blog/crystal-vs-tibetan-singing-bowls/' },
      { label: 'Every type of sound bath, explained', href: '/blog/every-type-of-sound-bath-explained/' },
    ],
    findOne: [
      { label: 'Boulder', href: '/cities/boulder/' },
      { label: 'Boston', href: '/cities/boston/' },
      { label: 'Chicago', href: '/cities/chicago/' },
    ],
  },
  {
    slug: 'alchemy-bowl',
    term: 'Brass and alchemy bowls',
    group: 'Instruments',
    definition:
      'Alchemy bowls are quartz bowls fused with metals or minerals, and brass bowls are metal bowls used mostly as accents inside a broader session.',
    context:
      'Alchemy bowls are a newer category. They are marketed with claims about specific frequencies or intentions tied to each blend, and those claims are not backed by research. Brass bowls and bells add a metallic texture. Both show up more often in workshops and practitioner trainings than as a dedicated class.',
    readMore: [{ label: 'Every type of sound bath, explained', href: '/blog/every-type-of-sound-bath-explained/' }],
    findOne: [{ label: 'Los Angeles', href: '/cities/los-angeles/' }],
  },
  {
    slug: 'tuning-forks',
    term: 'Tuning forks',
    group: 'Instruments',
    definition:
      'A tuning fork is a two-pronged metal instrument that rings at a fixed pitch when struck, used in sound healing both near the ears and pressed against the body.',
    context:
      'Medicine has used tuning forks for a long time, mainly to test hearing, vibration sense, and suspected fractures. In sound healing, practitioners use weighted forks on the skin or unweighted forks near the ears. The clinical evidence covers diagnostic use. There is little peer-reviewed research on tuning forks in sound baths specifically.',
    source: {
      label: 'De Marco et al., Journal of Bodywork and Movement Therapies (2024)',
      href: 'https://doi.org/10.1016/j.jbmt.2024.03.024',
    },
    findOne: [
      { label: 'Asheville', href: '/cities/asheville/' },
      { label: 'San Francisco', href: '/cities/san-francisco/' },
    ],
  },
  {
    slug: 'overtone-singing',
    term: 'Overtone singing',
    group: 'Instruments',
    definition:
      'Overtone singing is a vocal technique where one singer produces a held note and a second, higher whistling tone above it at the same time.',
    context:
      'Every bowl and gong produces overtones, the quieter higher pitches stacked on top of the main note. Overtone singing does the same thing with the human voice. Some practitioners lead voice-only sound baths built on overtones and group toning, where everyone hums along. These sessions are shorter and less common than bowl or gong formats.',
    readMore: [
      { label: 'Every type of sound bath, explained', href: '/blog/every-type-of-sound-bath-explained/' },
      { label: 'Sound bath music', href: '/blog/sound-bath-music/' },
    ],
  },
  {
    slug: '432-hz',
    term: '432 Hz and 528 Hz',
    group: 'Instruments',
    definition:
      '432 Hz and 528 Hz are tuning frequencies some practitioners choose for their instruments, often promoted as having special effects on the body.',
    context:
      'Most Western music tunes the note A to 440 Hz. Some sound healers tune to 432 Hz instead. The 528 Hz idea belongs to a set of "solfeggio frequencies" that come from modern alternative-health writing, not from research. Sustained, low sound can help you relax. No research shows one specific number works better than its neighbor.',
    readMore: [
      { label: 'Sound bath music: About frequencies', href: '/blog/sound-bath-music/' },
      { label: 'Is a sound bath spiritual or secular?', href: '/blog/is-a-sound-bath-spiritual-or-secular/' },
    ],
  },

  // ── Sound and the body ─────────────────────────────────────────────────
  {
    slug: 'nervous-system',
    term: 'Parasympathetic response',
    group: 'Sound and the body',
    definition:
      'The parasympathetic response is the "rest and digest" state of your nervous system, the shift sound baths are thought to encourage.',
    context:
      'The working theory involves the vagus nerve, which links your brain to your heart, lungs, and gut. Low, slow, sustained tones appear to increase vagal activity, the same shift that happens with slow breathing or a long exhale. Small heart rate variability studies support a relaxation effect during sessions. Large controlled trials do not exist yet.',
    readMore: [
      { label: 'Sound healing for anxiety', href: '/blog/sound-healing-for-anxiety/' },
      { label: 'Sound bath benefits', href: '/blog/sound-bath-benefits/' },
      { label: 'What is a sound bath?', href: '/blog/what-is-a-sound-bath/' },
    ],
  },
  {
    slug: 'brainwave-entrainment',
    term: 'Brainwave entrainment',
    group: 'Sound and the body',
    definition:
      'Brainwave entrainment is the claim that rhythmic sound can pull brain activity into slower states like alpha, theta, or delta.',
    context:
      'You will see it in a lot of sound bath marketing. The evidence is thin. Some studies show modest effects on attention and mood, but the methods are often weak. No good research shows that singing bowls reliably shift you into a specific brainwave state. Treat it as a proposed mechanism, not a proven one.',
    readMore: [
      { label: 'What is a sound bath?', href: '/blog/what-is-a-sound-bath/' },
      { label: 'Sound bath vs. meditation', href: '/blog/sound-bath-vs-meditation/' },
    ],
  },
  {
    slug: 'binaural-beats',
    term: 'Binaural beats',
    group: 'Sound and the body',
    definition:
      'Binaural beats are an auditory effect created by playing two slightly different tones in each ear, which the brain hears as a single pulsing tone.',
    context:
      'They only work through headphones, so they belong to recorded audio, not live sound baths. A 2019 meta-analysis of 22 studies found a medium effect on anxiety, pain perception, and some cognitive tasks. Longer listening helped more. Some live sessions layer binaural tracks under the instruments, but most do not.',
    source: {
      label: 'Garcia-Argibay et al., Psychological Research (2019)',
      href: 'https://pubmed.ncbi.nlm.nih.gov/30073406/',
    },
    findOne: [{ label: 'Best sound baths in Asheville', href: '/blog/best-sound-baths-asheville/' }],
  },
  {
    slug: 'vibroacoustic-therapy',
    term: 'Vibroacoustic therapy',
    group: 'Sound and the body',
    definition:
      'Vibroacoustic therapy delivers low-frequency sound vibration directly into the body, usually through a bed, chair, or table fitted with transducers.',
    context:
      'It is the most straightforward explanation for what you feel at a sound bath. A large gong or bowl sends vibration through the floor and into your body. Clinical research on vibroacoustic devices has found moderate support for pain and muscle tension. A few practitioners in the directory use VibroAcoustic sound tables alongside bowls.',
    readMore: [{ label: 'What is a sound bath?', href: '/blog/what-is-a-sound-bath/' }],
    findOne: [{ label: 'Asheville', href: '/cities/asheville/' }],
  },
  {
    slug: 'sound-meditation',
    term: 'Sound meditation',
    group: 'Sound and the body',
    definition:
      'Sound meditation is meditation that uses sound, like bowls, gongs, or a drone, as the object of attention instead of the breath.',
    context:
      'A sound bath is passive. You lie down and receive it. A sound meditation asks a bit more of you, usually returning your attention to the sound each time your mind wanders. The two overlap heavily, and many studios use the names interchangeably. Meditation is self-directed and free. A sound bath needs a practitioner and a room.',
    readMore: [
      { label: 'Sound bath vs. meditation', href: '/blog/sound-bath-vs-meditation/' },
      { label: 'Sound bath benefits', href: '/blog/sound-bath-benefits/' },
    ],
  },
  {
    slug: 'after-effects',
    term: 'Sound bath after effects',
    group: 'Sound and the body',
    definition:
      'Sound bath after effects are the sensations people notice in the hours after a session, most often calm, grogginess, tingling, or unexpected tears.',
    context:
      'Most people feel looser and a little foggy for an hour or two. Some feel emotional. Water, rest, and a slow exit help. A heavy, teary, or disoriented feeling usually fades the same day. Distress that lingers for days, or a flashback, is not a normal after effect and is worth getting support for.',
    readMore: [
      { label: 'What to expect after a sound bath', href: '/blog/what-to-expect-after-a-sound-bath/' },
      { label: 'Sound bath negative effects', href: '/blog/sound-bath-negative-effects/' },
    ],
  },

  // ── Practice and credentials ───────────────────────────────────────────
  {
    slug: 'sound-healing',
    term: 'Sound healing',
    group: 'Practice and credentials',
    definition:
      'Sound healing is the umbrella term for any practice that uses sound on purpose to support relaxation, emotional release, or a shift in mental state.',
    context:
      'It covers sound baths, chanting practices like kirtan, tuning fork sessions, and binaural recordings. Sound healing needs no clinical credential and is unregulated in the US. That makes it accessible. It also means training and quality vary a lot from one practitioner to the next.',
    readMore: [{ label: 'Sound therapy vs. sound healing vs. sound bath', href: '/blog/sound-therapy-vs-sound-healing-vs-sound-bath/' }],
    findOne: [
      { label: 'Los Angeles', href: '/cities/los-angeles/' },
      { label: 'Sedona', href: '/cities/sedona/' },
      { label: 'Santa Fe', href: '/cities/santa-fe/' },
    ],
  },
  {
    slug: 'sound-therapy',
    term: 'Sound therapy',
    group: 'Practice and credentials',
    definition:
      'Sound therapy is the clinical use of sound by a trained provider to treat a specific condition, like an audiologist using sound to manage tinnitus.',
    context:
      'The word "therapy" signals three things: clinical training, a treatment plan tied to a goal, and outcomes measured over time. Sound therapy is usually a series of sessions billed through a healthcare provider. A drop-in sound bath at a yoga studio is sound healing, not sound therapy, even when the listing uses the word.',
    readMore: [{ label: 'Sound therapy vs. sound healing vs. sound bath', href: '/blog/sound-therapy-vs-sound-healing-vs-sound-bath/' }],
    findOne: [
      { label: 'Boulder', href: '/cities/boulder/' },
      { label: 'San Francisco', href: '/cities/san-francisco/' },
    ],
  },
  {
    slug: 'music-therapy',
    term: 'Music therapy (MT-BC)',
    group: 'Practice and credentials',
    definition:
      'Music therapy is a licensed clinical profession, and MT-BC (Music Therapist-Board Certified) is its US credential, granted by the Certification Board for Music Therapists.',
    context:
      'Board-certified music therapists hold a degree, complete clinical training, and pass a national exam. That puts them in a different category from sound healing certificates, which no government body accredits. A few practitioners in the directory hold the MT-BC. If clinical grounding matters to you, look for it by name.',
    source: {
      label: 'Certification Board for Music Therapists: MT-BC',
      href: 'https://www.cbmt.org/candidates/candidates-faqs/',
    },
    findOne: [
      { label: 'Boulder', href: '/cities/boulder/' },
      { label: 'New York vs. LA sound bath scenes', href: '/blog/sound-bath-nyc-vs-la/' },
    ],
  },
  {
    slug: 'sound-bath-practitioner',
    term: 'Sound bath practitioner',
    group: 'Practice and credentials',
    definition:
      'A sound bath practitioner, also called a facilitator, is the person who plays the instruments and guides the session.',
    context:
      'There is no licensing board, so anyone can buy bowls and post a listing. The difference between a careful practitioner and a careless one is usually visible before you book. Look at their training, which instruments they use, how big the group is, and whether they ask about your health first.',
    readMore: [
      { label: 'How to choose a sound bath practitioner', href: '/blog/how-to-choose-a-sound-bath-practitioner/' },
      { label: 'Sound bath certifications', href: '/blog/sound-bath-certifications/' },
    ],
    findOne: [{ label: 'Browse all cities', href: '/cities/' }],
  },
  {
    slug: 'sound-healing-certification',
    term: 'Sound healing certification',
    group: 'Practice and credentials',
    definition:
      'A sound healing certification is a certificate from a private training program showing someone completed its course, not a license to practice.',
    context:
      'Sound healing is unregulated in the US. No license is legally required, and no government body accredits the programs. Programs range from weekend intensives to year-long tracks. A certificate tells you someone finished a specific course. It does not tell you they are skilled or safe, so check what the program actually covered.',
    readMore: [
      { label: 'Sound bath certifications', href: '/blog/sound-bath-certifications/' },
      { label: 'How to choose a sound bath practitioner', href: '/blog/how-to-choose-a-sound-bath-practitioner/' },
    ],
  },
  {
    slug: 'verified-listing',
    term: 'Verified listing',
    group: 'Practice and credentials',
    definition:
      'On Sound Dip, a verified listing is a session I have checked by hand: the venue confirmed, the schedule checked, and the booking link tested.',
    context:
      'Listings marked Verified online have been reviewed this way. I don\'t claim to have attended every session, and nothing gets labeled "vetted in person" unless it was. If I can\'t confirm a practitioner, they don\'t go up. Practitioners can add or correct their own listings, and those go through a verification step too.',
    readMore: [{ label: 'About Sound Dip', href: '/about/' }],
    findOne: [{ label: 'Find your dip', href: '/find-your-dip/' }],
  },
  {
    slug: 'integration',
    term: 'Integration',
    group: 'Practice and credentials',
    definition:
      'Integration is the quiet time after the sound ends, when you lie still, sit up slowly, and sometimes talk or journal before leaving.',
    context:
      'Some sessions build in a few minutes. Others run a full integration circle with sharing or movement. Private sessions usually include more of it than group classes, and longer ceremonial formats often treat it as a core part of the session. If you tend to feel foggy afterward, ask how much time the practitioner builds in.',
    readMore: [
      { label: 'Private sound bath guide', href: '/blog/private-sound-bath/' },
      { label: 'What to expect after a sound bath', href: '/blog/what-to-expect-after-a-sound-bath/' },
    ],
    findOne: [
      { label: 'Chicago', href: '/cities/chicago/' },
      { label: 'San Francisco', href: '/cities/san-francisco/' },
    ],
  },

  // ── Safety ─────────────────────────────────────────────────────────────
  {
    slug: 'contraindications',
    term: 'Contraindications',
    group: 'Safety',
    definition:
      'Contraindications are conditions that make a sound bath riskier, chiefly epilepsy, implanted electronic devices, severe tinnitus, and first-trimester pregnancy.',
    context:
      'The evidence behind most of these cautions is thin. They come from physiological reasoning, case reports, and practitioner consensus rather than large trials. That is why the practical advice is to talk to your doctor and tell the practitioner when you book. A practitioner who claims sound baths carry no risk is one to skip.',
    readMore: [
      { label: 'Sound bath negative effects', href: '/blog/sound-bath-negative-effects/' },
      { label: 'How to choose a sound bath practitioner', href: '/blog/how-to-choose-a-sound-bath-practitioner/' },
    ],
  },
  {
    slug: 'tinnitus',
    term: 'Tinnitus',
    group: 'Safety',
    definition:
      'Tinnitus is ringing or buzzing in the ears with no outside source, and loud or close sound at a sound bath can make it feel worse.',
    context:
      'Most sessions run at moderate volume, but gong peaks and bowls played near your head can bother reactive tinnitus. For many people the ringing feels louder for a while, then settles. If yours is severe, tell the practitioner when you book so they can lower the volume and keep instruments at a distance.',
    readMore: [
      { label: 'Sound bath negative effects: tinnitus', href: '/blog/sound-bath-negative-effects/' },
      { label: 'Sound therapy vs. sound healing', href: '/blog/sound-therapy-vs-sound-healing-vs-sound-bath/' },
    ],
  },
  {
    slug: 'trauma-response',
    term: 'Trauma response',
    group: 'Safety',
    definition:
      'A trauma response at a sound bath is a flashback, dissociation, or wave of distress triggered by lying still in a dim room with your attention turned inward.',
    context:
      'This can happen in any deep relaxation practice, not just sound baths. People with PTSD or a history of dissociation are more likely to have it. Sitting up, keeping your eyes open, and telling the practitioner you may step out all help. Some practitioners are trained in trauma-informed facilitation, and it is fair to ask.',
    readMore: [{ label: 'Sound bath negative effects', href: '/blog/sound-bath-negative-effects/' }],
    findOne: [
      { label: 'New York City', href: '/cities/new-york/' },
      { label: 'San Francisco', href: '/cities/san-francisco/' },
    ],
  },

  // ── Related practices ──────────────────────────────────────────────────
  {
    slug: 'reiki',
    term: 'Reiki',
    group: 'Related practices',
    definition:
      'Reiki is a Japanese energy practice where a practitioner places their hands lightly on or just above your body, and it is often paired with a sound bath.',
    context:
      'Many sessions in the directory combine bowls or gongs with hands-on Reiki. The National Center for Complementary and Integrative Health says Reiki has not been clearly shown to work for any health purpose, and there is no evidence for the energy field it describes. If a session includes touch, you can always decline it.',
    source: {
      label: 'National Center for Complementary and Integrative Health: Reiki',
      href: 'https://www.nccih.nih.gov/health/reiki',
    },
    findOne: [
      { label: 'Portland', href: '/cities/portland/' },
      { label: 'New York City', href: '/cities/new-york/' },
      { label: 'San Francisco', href: '/cities/san-francisco/' },
    ],
  },
  {
    slug: 'breathwork',
    term: 'Breathwork',
    group: 'Related practices',
    definition:
      'Breathwork is any practice that changes your breathing on purpose, from slow paced breathing to faster, more intense patterns, and it often opens a sound bath.',
    context:
      'A 2023 meta-analysis of randomized trials found breathwork lowered self-reported stress by a small to medium amount compared with controls. The authors also flagged the quality of many studies. Gentle slow breathing is low-risk. Fast or forceful styles can cause dizziness, so ask which kind a session uses.',
    source: {
      label: 'Fincham et al., Scientific Reports (2023)',
      href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9828383/',
    },
    findOne: [{ label: 'Los Angeles', href: '/cities/los-angeles/' }],
  },
  {
    slug: 'chakras',
    term: 'Chakras',
    group: 'Related practices',
    definition:
      'Chakras are the energy centers described in Hindu and Buddhist yogic and Tantric traditions, and the Sanskrit word means wheel or circle.',
    context:
      'Some practitioners frame their sessions around chakras, matching bowls or notes to each center. That framing comes from spiritual tradition, not physiology. You can enjoy a chakra-themed sound bath without sharing the belief, the same way you can attend a secular one. Ask how much spiritual language a session uses if that matters to you.',
    source: {
      label: 'Encyclopedia of Religion: Cakras',
      href: 'https://encyclopedia.com/environment/encyclopedias-almanacs-transcripts-and-maps/cakras',
    },
    findOne: [{ label: 'Is a sound bath spiritual or secular?', href: '/blog/is-a-sound-bath-spiritual-or-secular/' }],
  },
  {
    slug: 'integratron',
    term: 'Integratron',
    group: 'Related practices',
    definition:
      'The Integratron is a wooden dome in Landers, California, near Joshua Tree, that runs public crystal bowl sound baths inside its unusually resonant interior.',
    context:
      'George Van Tassel began building it in the 1950s, and its acoustics later made it famous among sound bath fans. It is the single biggest draw in the Joshua Tree area and has more reviews than any other listing in this directory. It closes for part of the year, so check the schedule before you plan a trip.',
    readMore: [{ label: 'Sound baths in Joshua Tree', href: '/cities/joshua-tree/' }],
    findOne: [{ label: 'Joshua Tree', href: '/cities/joshua-tree/' }],
  },
];
