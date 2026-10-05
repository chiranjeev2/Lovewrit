export interface DevotionalVerse {
  id: string;
  faith: "hindu" | "sikh" | "muslim" | "christian" | "jain" | "secular";
  title: string;
  source: string;
  scriptureText: string;
  transliteration?: string;
  meaning: string;
  verified: boolean; // Default false until independently reviewed by an elder/scholar of that faith
}

export const CURATED_DEVOTIONAL_VERSES: DevotionalVerse[] = [
  // --- HINDU TRADITION ---
  {
    id: "hindu-shanti-mantra",
    faith: "hindu",
    title: "Brihadaranyaka Upanishad • Shanti Mantra",
    source: "Brihadaranyaka Upanishad (1.4.14)",
    scriptureText: "ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।\nसर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्।\nॐ शान्तिः शान्तिः शान्तिः॥",
    transliteration: "Om Sarve Bhavantu Sukhinah Sarve Santu Niraamayaah | Sarve Bhadraanni Pashyantu Maa Kashcid-Duhkha-Bhaag-Bhavet | Om Shaantih Shaantih Shaantih ||",
    meaning: "May all sentient beings be happy; may all be free from illness; may all perceive what is auspicious and good; may no one experience suffering. Om Peace, Peace, Peace.",
    verified: false,
  },
  {
    id: "hindu-ganesha-vandana",
    faith: "hindu",
    title: "Shri Ganesha Vandana • Obstacle Removal",
    source: "Traditional Sanskrit Invocative Stotram",
    scriptureText: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
    transliteration: "Vakratunda Mahakaya Suryakoti Samaprabha | Nirvighnam Kuru Me Deva Sarvakaryeshu Sarvada ||",
    meaning: "O Lord with the curved trunk and magnificent form, radiant as ten million suns, please make all our endeavors free of obstacles, always.",
    verified: false,
  },
  {
    id: "hindu-gayatri-mantra",
    faith: "hindu",
    title: "Rigveda • Gayatri Mantra",
    source: "Rigveda (Mandala 3, Sukta 62, Verse 10)",
    scriptureText: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
    transliteration: "Om Bhur Bhuvah Svah Tat-Savitur-Varenyam | Bhargo Devasya Dheemahi Dhiyo Yo Nah Prachodayaat ||",
    meaning: "We meditate on the supreme, adorable radiance of the Divine Creator; may that divine illumination inspire and guide our intellect and understanding.",
    verified: false,
  },

  // --- SIKH TRADITION ---
  {
    id: "sikh-mool-mantar",
    faith: "sikh",
    title: "Sri Guru Granth Sahib Ji • Mool Mantar",
    source: "Sri Guru Granth Sahib Ji (Ang 1)",
    scriptureText: "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
    transliteration: "Ik Oankar Sat Naam Karta Purakh Nirbhau Nirvair Akaal Moorat Ajoonee Saibhang Gur Parsaad ||",
    meaning: "One Universal Creator God; Truth is His Name; Creative Being Personified; Without Fear; Without Hatred; Timeless Form; Unborn and Beyond Incarnation; Self-Existent; Realized by the Grace of the True Guru.",
    verified: false,
  },
  {
    id: "sikh-sukhmani-sahib",
    faith: "sikh",
    title: "Sukhmani Sahib • Peace & Healing",
    source: "Sri Guru Granth Sahib Ji (Ang 274, Guru Arjan Dev Ji)",
    scriptureText: "ਸਰਬ ਰੋਗ ਕਾ ਅਉਖਦੁ ਨਾਮੁ ॥ ਕਲਿਆਣ ਰੂਪ ਮੰਗਲ ਗੁਣ ਗਾਮ ॥",
    transliteration: "Sarab Rog Kaa Aoukhadh Naam || Kalyaan Roop Mangal Gun Gaam ||",
    meaning: "The Divine Name is the remedy for all afflictions; singing praises of the Almighty brings pure tranquility, auspicious joy, and ultimate salvation.",
    verified: false,
  },
  {
    id: "sikh-ardas-blessing",
    faith: "sikh",
    title: "Gurbani • Joy of Sangat",
    source: "Sri Guru Granth Sahib Ji (Ang 396)",
    scriptureText: "ਜਹ ਸਾਧਸੰਤ ਇਕਤ੍ਰ ਹੋਵਹਿ ਤਹ ਅਨੰਦੁ ਬਿਲਾਸੁ ॥",
    transliteration: "Jah Saadh-Sant Ekatr Hovahi Tah Anand Bilaas ||",
    meaning: "Wherever the holy community gathers with pure hearts, there divine bliss and celebration reside.",
    verified: false,
  },

  // --- MUSLIM TRADITION ---
  {
    id: "muslim-family-blessing",
    faith: "muslim",
    title: "Surah Al-Furqan • Prayer for Household Joy",
    source: "Holy Quran (Surah Al-Furqan 25:74)",
    scriptureText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nرَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    transliteration: "Bismillahir-Rahmanir-Rahim. Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama.",
    meaning: "In the name of Allah, the Most Compassionate, Most Merciful. Our Lord! Grant that our spouses and offspring may be the joy and solace of our eyes, and cause us to be foremost among the righteous.",
    verified: false,
  },
  {
    id: "muslim-ibrahim-prayer",
    faith: "muslim",
    title: "Surah Ibrahim • Prayer of Prophet Ibrahim",
    source: "Holy Quran (Surah Ibrahim 14:40)",
    scriptureText: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّاتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    transliteration: "Rabbi-j'alni muqimas-salati wa min dhurriyyati, Rabbana wa taqabbal du'a.",
    meaning: "My Lord! Make me steadfast in prayer, and also from among my descendants; Our Lord, graciously accept our supplication.",
    verified: false,
  },
  {
    id: "muslim-al-isra-barakah",
    faith: "muslim",
    title: "Surah Al-Isra • Sincere Entrance & Grace",
    source: "Holy Quran (Surah Al-Isra 17:80)",
    scriptureText: "وَقُل رَّبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ وَاجْعَل لِّي مِن لَّدُنكَ سُلْطَانًا نَّصِيرًا",
    transliteration: "Wa qur-Rabbi adkhilni mudkhala sidqin wa akhrijni mukhraja sidqin waj'al li min ladunka sultanan nasira.",
    meaning: "And say: 'My Lord! Grant me an entrance through truth, and an exit through truth; and grant me from Your Presence a supportive, guiding power.'",
    verified: false,
  },

  // --- CHRISTIAN TRADITION ---
  {
    id: "christian-priestly-blessing",
    faith: "christian",
    title: "Numbers 6:24-26 • The Priestly Blessing",
    source: "The Holy Bible (Numbers 6:24-26)",
    scriptureText: "The Lord bless you and keep you;\nThe Lord make His face shine upon you and be gracious to you;\nThe Lord lift up His countenance upon you and give you peace.",
    meaning: "A timeless, sacred benediction invoking God's unending protection, radiant grace, and eternal peace over individuals and gathered families.",
    verified: false,
  },
  {
    id: "christian-1-corinthians",
    faith: "christian",
    title: "1 Corinthians 13:4-7 • Hymn of Love",
    source: "The Holy Bible (1 Corinthians 13:4-7)",
    scriptureText: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It always protects, always trusts, always hopes, always perseveres. Love never fails.",
    meaning: "The apostle Paul's profound description of selfless, enduring agape love that forms the cornerstone of every blessed relationship and home.",
    verified: false,
  },
  {
    id: "christian-matthew-gathering",
    faith: "christian",
    title: "Matthew 18:20 • Fellowship Blessing",
    source: "The Holy Bible (Matthew 18:20)",
    scriptureText: "For where two or three gather in my name, there am I with them.",
    meaning: "The assurance of divine presence, guidance, and peace whenever faithful hearts assemble together in love and fellowship.",
    verified: false,
  },

  // --- SECULAR / UNIVERSAL TRADITION ---
  {
    id: "secular-gathering-light",
    faith: "secular",
    title: "Universal Reflection • The Light of Gathering",
    source: "Timeless Humanist Wisdom",
    scriptureText: "May this gathering be filled with the warmth of loving hearts, the quiet joy of shared smiles, and the enduring beauty of friendship and family that binds us all across time.",
    meaning: "An inclusive celebration of community, unity, and mutual care honoring the shared human spirit without dogma.",
    verified: false,
  },
  {
    id: "secular-gratitude-peace",
    faith: "secular",
    title: "Universal Reflection • Peace & Compassion",
    source: "Universal Contemplation",
    scriptureText: "Let us walk with gentle steps upon this earth, speaking words that heal, holding hearts that need solace, and creating memories of unconditional kindness.",
    meaning: "A dedication to living peacefully with empathy, gratitude, and kindness toward every fellow being.",
    verified: false,
  },

  // --- JAIN TRADITION ---
  {
    id: "jain-navkar-mantra",
    faith: "jain",
    title: "Navkar (Namokar) Mantra • Universal Veneration",
    source: "Foundational Canonical Jain Prayer",
    scriptureText: "णमो अरिहंताणं। णमो सिद्धाणं। णमो आयरियाणं। णमो उवज्झायाणं। णमो लोए सव्वसाहूणं।\nएसोपंचणमुक्कारो, सव्वपावप्पणासणो। मंगला णं च सव्वेसिं, पढमं हवई मंगलं॥",
    transliteration: "Ṇamō Arihantāṇaṁ | Ṇamō Siddhāṇaṁ | Ṇamō Āyariyāṇaṁ | Ṇamō Uvajjhāyāṇaṁ | Ṇamō Lōē Savva Sāhūṇaṁ | Ēsō Pañcha Ṇamukkārō Savva Pāvappaṇāsaṇō | Maṅgalāṇaṁ Cha Savvēsiṁ Paḍhamaṁ Havaī Maṅgalaṁ ||",
    meaning: "I bow to the Arihantas; I bow to the Siddhas; I bow to the Acharyas; I bow to the Upadhyayas; I bow to all the Sadhus in the world. This five-fold obeisance destroys all sins and is the foremost among all auspicious blessings.",
    verified: false,
  },
];

export function getVersesByFaith(faith: string): DevotionalVerse[] {
  return CURATED_DEVOTIONAL_VERSES.filter((v) => v.faith === faith);
}

export function getDefaultVerseForFaith(faith: string): DevotionalVerse {
  const match = CURATED_DEVOTIONAL_VERSES.find((v) => v.faith === faith);
  return match || CURATED_DEVOTIONAL_VERSES[0];
}

/**
 * Provides a blank template for buyers who wish to write their own blessing.
 */
export function getBlankBlessingForFaith(faith: "hindu" | "sikh" | "muslim" | "christian" | "jain" | "secular"): DevotionalVerse {
  return {
    id: `custom-blessing-${faith}`,
    faith,
    title: "Personal Family Blessing",
    source: "Family Tradition & Personal Prayer",
    scriptureText: "",
    transliteration: "",
    meaning: "",
    verified: true,
  };
}
