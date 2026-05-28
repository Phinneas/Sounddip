export interface City {
  slug: string;
  name: string;
  region: string;
  tier: 1 | 2 | 3;
  tagline: string;
  sessionCount: number;
  priceRange: string;
  formats: string[];
  scene: string;
  venues: { name: string; note: string }[];
  beginner: string;
  img: string;
  imgAlt: string;
}

export const cities: City[] = [
  {
    slug: "austin",
    name: "Austin",
    region: "Texas",
    tier: 1,
    tagline: "The quietest city in the loudest state.",
    sessionCount: 14,
    priceRange: "$35–$75",
    formats: ["Crystal bowls", "Gong bath", "Cacao ceremony + sound"],
    scene: `Austin's sound bath scene is small enough to feel like a secret and just developed enough to take seriously. The city's wellness culture runs deep — yoga studios here have been filling for twenty years — but sound healing arrived late and hasn't been colonized by studio chains yet. What you find instead are independent practitioners working out of converted bungalows, yoga lofts on the east side, and the occasional backyard pop-up in Barton Hills.\n\nThe city's music identity is everywhere here, even in the healing space. Practitioners tend to have a background in actual performance — several are working musicians who found their way to sound healing through recording and acoustics. That shows in the sessions: there's more improvisation, more attention to room resonance, less clinical rigidity than you'd find in a coastal city.\n\nLetsbatch — a party-booking platform — currently outranks every local practitioner in search results, which tells you exactly how much room there is. No editorial has covered the scene. No directory exists. Austin is a first-mover opportunity for anyone willing to show up consistently.`,
    venues: [
      { name: "Meditation Bar", note: "The most developed studio in the city — multiple weekly sessions, trained practitioners, consistent format." },
      { name: "East Austin yoga lofts", note: "Several studios on the east side host rotating sound practitioners; check individual studio schedules." },
      { name: "Private home sessions", note: "A meaningful portion of Austin's practitioners work by appointment only — worth asking around." },
    ],
    beginner: "Start with Meditation Bar on a weeknight — the sessions run 60 minutes, the room is well-designed for sound, and the instructors explain what's happening before you lie down. Bring a mat and something warm. Austin studios run cold.",
    img: "https://images.stockcake.com/public/3/4/6/346ed7ec-2f7d-4dd2-a744-572f9cfcbd96_large/historic-brick-townhouses-stockcake.jpg",
    imgAlt: "Austin bungalows at dusk",
  },
  {
    slug: "chicago",
    name: "Chicago",
    region: "Illinois",
    tier: 1,
    tagline: "Zero editorial coverage. Eight practitioners worth profiling.",
    sessionCount: 22,
    priceRange: "$40–$90",
    formats: ["Tibetan singing bowls", "Crystal bowls", "Gong", "Voice + overtone"],
    scene: `Chicago's sound healing scene is denser than it looks from the outside, which is partly why the absence of any editorial coverage is so striking. The city has serious practitioners doing serious work — and Google is so starved for content that the St. Regis hotel's luxury spa ranks on page one, which is less a competitor and more a signal: when a hotel spa is your top result, the information infrastructure doesn't exist yet.\n\nThe Ahimsa School of Sound Healing is the most significant institutional presence, running training programs and sessions across three neighborhoods — Oak Park, Evanston, and Wicker Park. That geographic spread is useful for a directory: Chicago practitioners tend to be neighborhood-specific in a way that New York or LA practitioners aren't, because the city's transit patterns make cross-neighborhood attendance less casual.\n\nThe scene skews toward longer, more ceremonial formats. A 90-minute Tibetan bowl session with extended silence and a post-session integration period is more common here than the tightly-scheduled 60-minute drop-in class. That's not a knock — it reflects a practitioner culture that takes the therapeutic framing seriously.`,
    venues: [
      { name: "Ahimsa School of Sound Healing", note: "Multi-location, trained faculty, both public sessions and practitioner training. Wicker Park location easiest to access." },
      { name: "Evanston wellness centers", note: "Several established yoga and wellness studios in Evanston host rotating sound practitioners." },
      { name: "Oak Park", note: "Quieter suburban location of Ahimsa — worth considering if you want a smaller group." },
    ],
    beginner: "Ahimsa's public sessions are the right starting point. They're taught by trained practitioners, they explain the format beforehand, and the Wicker Park location is accessible. Expect a longer session than you might in other cities — 90 minutes is common — and plan to stay horizontal for all of it.",
    img: "https://images.stockcake.com/public/c/a/9/ca9d020a-5813-4a78-8fcc-73fae068ce57/golden-hour-street-stockcake.jpg",
    imgAlt: "Chicago street at golden hour",
  },
  {
    slug: "new-york-city",
    name: "New York City",
    region: "New York",
    tier: 1,
    tagline: "No directory. Every studio has a website. Nobody links to each other.",
    sessionCount: 47,
    priceRange: "$38–$120",
    formats: ["Crystal bowls", "Gong bath", "Voice + bowl", "Outdoor", "1-on-1 private"],
    scene: `New York has more sound bath options than any other American city and less infrastructure for finding them than you'd expect. The studios that exist — Official Ritual in the West Village, Sage + Sound in multiple neighborhoods, Humming Puppy with its subwoofer floor — all have real SEO presence, real followings, and real design investment. They've done the work. What none of them have done is connect to each other, create a shared discovery layer, or make it easy for someone new to the city or the practice to understand the options.\n\nSoundawn holds two search result URLs for New York queries, which matters, but their coverage is thin and unfiltered — they list without describing. Brooklyn is the densest borough for practitioners, particularly Williamsburg and Greenpoint, where the sound bath class has become as neighborhood-standard as the yoga class was ten years ago. Manhattan concentrations are in the West Village and increasingly the Upper West Side.\n\nPrice range is the widest of any city on this list. A drop-in Williamsburg group session can run $38. A private 90-minute session with a credentialed Harlem practitioner might run $150. Both are findable through word of mouth. Neither is easy to find through search.`,
    venues: [
      { name: "Official Ritual", note: "West Village. One of the most design-forward sound spaces in the country. Book early." },
      { name: "Sage + Sound", note: "Multiple NYC locations, consistent programming, good for drop-in visits." },
      { name: "Humming Puppy", note: "Subwoofer-equipped floor — a genuinely different physical experience. Worth trying for the novelty alone." },
      { name: "Williamsburg and Greenpoint studios", note: "High practitioner density, wide price range, mix of independent and studio-affiliated." },
    ],
    beginner: "Start with Sage + Sound — they have good entry-level framing, multiple locations, and the drop-in format removes commitment. If you want something more memorable for a first experience, Humming Puppy's format is distinctive enough to be worth the extra cost.",
    img: "https://images.stockcake.com/public/3/4/6/346ed7ec-2f7d-4dd2-a744-572f9cfcbd96_large/historic-brick-townhouses-stockcake.jpg",
    imgAlt: "New York brownstones",
  },
  {
    slug: "atlanta",
    name: "Atlanta",
    region: "Georgia",
    tier: 2,
    tagline: "The highest practitioner density of any audited city. Still waiting for a directory.",
    sessionCount: 31,
    priceRange: "$30–$80",
    formats: ["Crystal bowls", "Gong", "Cacao + sound", "Mobile / outdoor"],
    scene: `Atlanta surprised us. Of the five cities where we did full SERP audits, Atlanta had more individual practitioner websites than any other — eight distinct practitioners with developed web presences, compared to four or five in comparably-sized markets. The scene is active, it's distributed across multiple neighborhoods (Decatur, Virginia-Highland, Buckhead, the Westside), and it's almost entirely invisible to anyone searching online.\n\nThe only editorial coverage is an Atlanta Magazine piece that's static, undated, and contains no booking information. That's the entire information infrastructure for a city of six million people in the metro. A structured, updated, bookable directory page becomes the best resource by default — not because it's particularly good, but because nothing else exists.\n\nThe most distinctive practitioner in the Atlanta scene is Zenmi, who runs mobile floating sound bath sessions — a format that involves individual float tanks with embedded speakers, creating a combination of sensory deprivation and sound immersion. It's genuinely unusual and worth flagging as a differentiator.`,
    venues: [
      { name: "Zenmi Mobile Sound Bath", note: "Float-tank-based sound immersion, brought to you. Unusual format, genuinely worth trying." },
      { name: "Decatur yoga and wellness studios", note: "Several established studios host rotating practitioners; Decatur has the highest concentration." },
      { name: "Virginia-Highland", note: "Neighborhood with strong independent wellness culture and multiple individual practitioners working from home studios." },
    ],
    beginner: "Atlanta's scene is more decentralized than other cities — there's no single obvious starting point. Look for a group crystal bowl session at one of the Decatur studios first: lower price point, easier format to navigate, and you'll meet practitioners who can point you toward next steps.",
    img: "https://images.stockcake.com/public/3/4/6/346ed7ec-2f7d-4dd2-a744-572f9cfcbd96_large/historic-brick-townhouses-stockcake.jpg",
    imgAlt: "Atlanta neighborhood at dusk",
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    region: "California",
    tier: 2,
    tagline: "The hardest editorial entry. Still no directory.",
    sessionCount: 58,
    priceRange: "$45–$150",
    formats: ["Crystal bowls", "Gong", "Cacao ceremony", "Forest bath", "Private 1-on-1"],
    scene: `Los Angeles is the most competitive sound bath market in the country and the hardest editorial entry on this list. The LA Times has coverage. Modernhypno holds a listicle slot. The Soundbath Center has been operating for over twenty years and has real domain authority. This is not an empty SERP.\n\nAnd yet: there is no directory. Every piece of content that exists is static — no filtering by format or price, no practitioner profiles, no booking links, no way to understand the difference between a $45 group session in Silver Lake and a $150 private ceremony in Topanga. That's still the gap, even here.\n\nThe LA scene has its own character: it skews more ceremonial than therapeutic, more cacao-and-intention than clinical-and-evidenced, more likely to be held outdoors or in a backyard space than a purpose-built studio. Topanga Canyon has a cluster of practitioners doing genuinely unusual work — longer formats, more improvised, more nature-integrated. The Soundbath Center in Venice remains the institutional anchor for the city and is worth visiting at least once as a reference point.`,
    venues: [
      { name: "The Soundbath Center", note: "Venice. Twenty-plus years of operation, serious practitioner community, multiple formats weekly." },
      { name: "Topanga Canyon practitioners", note: "More ceremonial, longer formats, outdoor settings. Worth the drive if you're after something different." },
      { name: "Silver Lake and Los Feliz", note: "Highest density of independent practitioners in the city, wide price range." },
    ],
    beginner: "The Soundbath Center in Venice is the right first stop in LA — it's the most established space in the city, the sessions are well-run, and the price point is reasonable for the format. Don't start with a private ceremony or a Topanga weekend retreat until you know you want to go deeper.",
    img: "https://images.stockcake.com/public/3/4/6/346ed7ec-2f7d-4dd2-a744-572f9cfcbd96_large/historic-brick-townhouses-stockcake.jpg",
    imgAlt: "Los Angeles at dusk",
  },
  {
    slug: "seattle",
    name: "Seattle",
    region: "Washington",
    tier: 1,
    tagline: "KD 3. Dense wellness infrastructure. The SERP is empty.",
    sessionCount: 19,
    priceRange: "$35–$85",
    formats: ["Crystal bowls", "Gong bath", "Rain + forest sound", "Tibetan bowls"],
    scene: `Seattle has one of the strongest wellness cultures of any American city — yoga has been a neighborhood fixture here for twenty years, meditation centers are well-attended, and the Pacific Northwest relationship with nature makes the resonance-and-stillness framing of sound healing feel locally intuitive. And yet the SERP for "sound bath Seattle" is nearly empty. A keyword difficulty of 3 means essentially no established competition.\n\nThe scene that exists tends to reflect the city's broader character: quieter, more nature-forward, less performative than what you'd find in LA or New York. Practitioners here are more likely to incorporate natural sound elements — rain recordings, recordings from local forests, outside sessions when the Seattle weather allows. Several studios in Capitol Hill and Fremont have begun adding sound sessions to existing yoga and meditation programming, which is how the scene tends to grow in cities without a dedicated anchor studio.\n\nThe Pacific Northwest practitioner community is also unusually networked — Seattle and Portland practitioners often know each other, collaborate, and share spaces. Building relationships with Seattle practitioners opens Portland almost automatically.`,
    venues: [
      { name: "Capitol Hill wellness studios", note: "Several established yoga studios now offer regular sound sessions — check individual schedules." },
      { name: "Fremont", note: "The neighborhood with the most independent wellness infrastructure and the most likely to have a rotating sound practitioner." },
      { name: "Outdoor and forest sessions", note: "Worth watching for — several practitioners run seasonal outdoor sessions in parks and forest settings around the city." },
    ],
    beginner: "Ask at any established yoga studio in Capitol Hill whether they have a sound session on the schedule, or look for upcoming events in Fremont. Seattle's scene is small enough that word of mouth from a single studio gets you into the community quickly.",
    img: "https://images.stockcake.com/public/3/4/6/346ed7ec-2f7d-4dd2-a744-572f9cfcbd96_large/historic-brick-townhouses-stockcake.jpg",
    imgAlt: "Seattle neighborhood",
  },
  {
    slug: "portland",
    name: "Portland",
    region: "Oregon",
    tier: 1,
    tagline: "Independent practitioners, no dominant studio, strong market fit.",
    sessionCount: 19,
    priceRange: "$30–$70",
    formats: ["Crystal bowls", "Gong", "Voice + sound", "Cacao + bowls"],
    scene: `Portland's wellness culture runs toward the independent and the idiosyncratic — there are fewer studio chains here and more individual practitioners working from home studios, yoga lofts, and community spaces. That's exactly the profile that a practitioner directory aggregates best. The keyword difficulty of 21 means there's some competition, but nothing that a well-structured page can't outperform over time.\n\nThe scene is genuinely community-driven in a way that other cities aren't. Practitioners here are more likely to offer sliding-scale pricing, donation-based sessions, or community nights that price around $20–30. That's partly economics and partly values — Portland's wellness community has a longstanding distrust of the commodification that happened to yoga in other markets, and sound healing practitioners have largely avoided it so far.\n\nThe neighborhoods that matter are SE Portland, particularly Division and Hawthorne, and North Portland around Mississippi Avenue. Both have strong existing wellness infrastructure. A smaller cluster exists in the Pearl District, which skews toward more premium private sessions.`,
    venues: [
      { name: "SE Portland — Division and Hawthorne", note: "Highest practitioner density in the city. Mix of established studios and independent practitioners." },
      { name: "Mississippi Avenue (North Portland)", note: "Strong community wellness culture, sliding-scale sessions common here." },
      { name: "Pearl District", note: "Premium end of the market — private sessions and smaller group formats." },
    ],
    beginner: "Portland is a good city to start in if price is a concern — sliding-scale and community sessions are genuinely common, and the practitioners who offer them are not running lesser sessions. Check community bulletin boards in SE Portland yoga studios, or look for donation-based events posted to local wellness Facebook groups.",
    img: "https://images.stockcake.com/public/3/4/6/346ed7ec-2f7d-4dd2-a744-572f9cfcbd96_large/historic-brick-townhouses-stockcake.jpg",
    imgAlt: "Portland street",
  },
  {
    slug: "denver",
    name: "Denver",
    region: "Colorado",
    tier: 2,
    tagline: "Denver metro plus the Boulder cluster — the densest sound healing concentration outside LA.",
    sessionCount: 16,
    priceRange: "$35–$80",
    formats: ["Crystal bowls", "Gong", "Tibetan bowls", "Cacao ceremony"],
    scene: `Denver and Boulder together form the densest sound healing cluster outside of Los Angeles. Boulder specifically has nationally recognized practitioners — several have trained with lineage teachers, run certification programs, and attract students from across the country. Denver captures the metro demand; Boulder has the institutional depth.\n\nThe Denver scene is more accessible and mainstream than Boulder's — studios in RiNo and Capitol Hill (Denver's version, distinct from Seattle's) have added sound sessions to yoga programming, and the format is increasingly showing up in corporate wellness programs given Denver's tech and outdoor industry presence. The price range is reasonable and the quality floor is higher than you'd expect from a market this size.\n\nBoulder warrants its own Sounddip page eventually. The practitioner community there is serious, the retreat infrastructure is significant, and the search queries are distinct. For now, a Denver page that acknowledges Boulder's proximity and links appropriately covers both.`,
    venues: [
      { name: "RiNo arts district", note: "Highest concentration of studios with sound programming in Denver proper." },
      { name: "Boulder practitioner network", note: "Multiple nationally recognized practitioners, retreat formats, certification training. Worth the 45-minute drive." },
      { name: "Capitol Hill Denver", note: "Several established yoga studios with rotating sound practitioners." },
    ],
    beginner: "Start in Denver proper rather than driving to Boulder — the RiNo studios have well-run group sessions at accessible price points. Once you've been to two or three sessions and know you want to go deeper, a Boulder retreat or workshop with a credentialed teacher is a natural next step.",
    img: "https://images.stockcake.com/public/3/4/6/346ed7ec-2f7d-4dd2-a744-572f9cfcbd96_large/historic-brick-townhouses-stockcake.jpg",
    imgAlt: "Denver skyline",
  },
  {
    slug: "nashville",
    name: "Nashville",
    region: "Tennessee",
    tier: 2,
    tagline: "Music City has an obvious angle. Nobody has written it yet.",
    sessionCount: 12,
    priceRange: "$30–$65",
    formats: ["Crystal bowls", "Gong", "Voice + sound", "Cacao + bowls"],
    scene: `Nashville is an emerging market with an editorial hook no other city has: Music City. The relationship between Nashville's identity as a place where sound is taken seriously — where acoustics matter, where musicians think about resonance and tone as professional concerns — and the sound healing tradition is genuinely interesting and almost entirely unwritten. That's an unusual opportunity for a directory that can carry a point of view.\n\nThe wellness scene in Nashville has grown significantly with the influx of residents from other markets over the past decade. The East Nashville neighborhood in particular has developed a strong independent wellness culture, and sound practitioners have been part of that wave. The price points are lower than coastal cities, which makes Nashville sessions accessible to demographics that might not engage at LA or New York prices.\n\nThe scene is still small enough that individual practitioners are easy to access and willing to talk. This is a market where building relationships with two or three anchor practitioners creates a self-sustaining information network.`,
    venues: [
      { name: "East Nashville", note: "The neighborhood with the strongest independent wellness culture in the city. Start here." },
      { name: "Germantown", note: "Smaller cluster of wellness studios, more premium pricing, closer to downtown." },
      { name: "Home studios and pop-ups", note: "A significant portion of Nashville practitioners work by appointment from home studios." },
    ],
    beginner: "East Nashville is the right neighborhood to start in. Ask at yoga studios on Gallatin Pike or McFerrin Avenue whether they have a sound session on the schedule, or look for pop-up events posted to local Instagram wellness accounts — Nashville's scene is social-media-driven in a way that older cities aren't.",
    img: "https://images.stockcake.com/public/3/4/6/346ed7ec-2f7d-4dd2-a744-572f9cfcbd96_large/historic-brick-townhouses-stockcake.jpg",
    imgAlt: "Nashville neighborhood",
  },
  {
    slug: "philadelphia",
    name: "Philadelphia",
    region: "Pennsylvania",
    tier: 3,
    tagline: "KD 5 with 1.5M people. The mismatch worth exploiting.",
    sessionCount: 11,
    priceRange: "$30–$70",
    formats: ["Crystal bowls", "Gong bath", "Tibetan bowls", "Voice + sound"],
    scene: `Philadelphia has a keyword difficulty of 5 for "sound bath Philadelphia" and a metro population of 1.5 million. That mismatch is unusual and worth exploiting before someone else notices it. The city's arts and wellness culture is strong — it has several established independent wellness communities, a serious yoga scene that's been developing for fifteen years, and a cost-of-living structure that supports small practitioners in a way that New York can't.\n\nThe Philly scene is concentrated in a few neighborhoods: Fishtown is the obvious one, with its well-developed independent arts and wellness culture. West Philadelphia around Clark Park has a community wellness scene that runs toward more sliding-scale and accessible formats. Center City has a smaller cluster of more premium private practitioners.\n\nPhiladelphia clusters naturally with New York for content purposes — it's two hours away, it's in the same cultural orbit, and someone searching from Philly is likely to be the same searcher who'd look at New York results. Building both pages creates a Northeast corridor presence that reinforces itself.`,
    venues: [
      { name: "Fishtown", note: "Highest concentration of independent wellness studios in the city. Crystal bowl and gong sessions most common." },
      { name: "West Philadelphia / Clark Park area", note: "Community wellness culture, sliding-scale sessions, donation-based formats." },
      { name: "Center City", note: "Premium private practitioners, smaller group formats." },
    ],
    beginner: "Fishtown is the right starting neighborhood — several established yoga and wellness studios there have added regular sound sessions, and the neighborhood's walkable density means you can ask around easily. Expect a smaller scene than New York or LA, which is actually an advantage: practitioners here are more accessible and sessions are easier to book on short notice.",
    img: "https://images.stockcake.com/public/3/4/6/346ed7ec-2f7d-4dd2-a744-572f9cfcbd96_large/historic-brick-townhouses-stockcake.jpg",
    imgAlt: "Philadelphia rowhouses",
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
