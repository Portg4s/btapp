export type CategorySearchSeed = {
  key: string;
  query: string;
};

export const categorySearchSeeds: Record<string, CategorySearchSeed[]> = {
  Anime: [
    { key: "naruto", query: "Naruto opening" },
    { key: "one-piece", query: "One Piece opening" },
    { key: "dragon-ball-z", query: "Dragon Ball Z opening" },
    { key: "pokemon", query: "Pokemon theme" },
    { key: "attack-on-titan", query: "Attack on Titan opening" },
    { key: "demon-slayer", query: "Demon Slayer opening" },
    { key: "death-note", query: "Death Note opening" },
    { key: "sailor-moon", query: "Sailor Moon theme" },
  ],
  "Années 2000": [
    { key: "crazy-in-love", query: "Crazy in Love Beyonce" },
    { key: "toxic", query: "Toxic Britney Spears" },
    { key: "seven-nation-army", query: "Seven Nation Army" },
    { key: "hey-ya", query: "Hey Ya OutKast" },
    { key: "in-the-end", query: "In the End Linkin Park" },
    { key: "umbrella", query: "Umbrella Rihanna" },
    { key: "viva-la-vida", query: "Viva la Vida Coldplay" },
    { key: "i-gotta-feeling", query: "I Gotta Feeling Black Eyed Peas" },
  ],
  Disney: [
    { key: "frozen", query: "Let It Go Frozen" },
    { key: "lion-king", query: "Hakuna Matata Lion King" },
    { key: "aladdin", query: "A Whole New World Aladdin" },
    { key: "little-mermaid", query: "Under the Sea Little Mermaid" },
    { key: "toy-story", query: "You ve Got a Friend in Me Toy Story" },
    { key: "lion-king", query: "Circle of Life Lion King" },
    { key: "mulan", query: "I ll Make a Man Out of You Mulan" },
    { key: "encanto", query: "We Don t Talk About Bruno Encanto" },
  ],
  Films: [
    { key: "harry-potter", query: "Harry Potter theme" },
    { key: "star-wars", query: "Star Wars theme" },
    { key: "pirates-caribbean", query: "Pirates of the Caribbean theme" },
    { key: "titanic", query: "Titanic My Heart Will Go On" },
    { key: "ghostbusters", query: "Ghostbusters theme" },
    { key: "lord-of-the-rings", query: "The Lord of the Rings theme" },
    { key: "james-bond", query: "James Bond theme" },
    { key: "rocky", query: "Rocky Eye of the Tiger" },
  ],
  "Jeux vidéo": [
    { key: "super-mario", query: "Super Mario Bros theme" },
    { key: "zelda", query: "The Legend of Zelda theme" },
    { key: "pokemon", query: "Pokemon theme" },
    { key: "tetris", query: "Tetris theme" },
    { key: "sonic", query: "Sonic the Hedgehog theme" },
    { key: "final-fantasy", query: "Final Fantasy theme" },
    { key: "skyrim", query: "Skyrim theme" },
    { key: "halo", query: "Halo theme" },
  ],
  "Rap FR": [
    { key: "iam-je-danse-le-mia", query: "IAM Je danse le mia" },
    { key: "ntm-ma-benz", query: "NTM Ma Benz" },
    { key: "mc-solaar-bouge-de-la", query: "MC Solaar Bouge de la" },
    { key: "booba-boulbi", query: "Booba Boulbi" },
    { key: "orelsan-basique", query: "Orelsan Basique" },
    { key: "pnl-au-dd", query: "PNL Au DD" },
    { key: "nekfeu-on-verra", query: "Nekfeu On verra" },
    { key: "jul-tchikita", query: "Jul Tchikita" },
  ],
  Séries: [
    { key: "friends", query: "Friends theme" },
    { key: "game-of-thrones", query: "Game of Thrones theme" },
    { key: "stranger-things", query: "Stranger Things theme" },
    { key: "simpsons", query: "The Simpsons theme" },
    { key: "the-office", query: "The Office theme" },
    { key: "breaking-bad", query: "Breaking Bad theme" },
    { key: "walking-dead", query: "The Walking Dead theme" },
    { key: "la-casa-de-papel", query: "La Casa de Papel Bella Ciao" },
  ],
};

export function getCategorySearchSeedEntries(categories: string[]) {
  return categories.flatMap((category) =>
    (categorySearchSeeds[category] ?? []).map((seed) => ({
      ...seed,
      category,
    })),
  );
}

export function getCategorySearchSeeds(categories: string[]) {
  return getCategorySearchSeedEntries(categories).map((seed) => seed.query);
}
