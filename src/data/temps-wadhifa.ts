export const tempsWadhifaMeta = {
  title: "Le temps d'accomplissement de la Wadhifa",
  author: "Zaouiya Tidjaniya El Koubra d'Europe",
  source: "tidjaniya.com",
};

export interface ArticleSection {
  id: string;
  chapter: string;
  heading: string;
  content: string;
}

export const tempsWadhifaSections: ArticleSection[] = [
  {
    id: "wadhifa-1",
    chapter: "La Wadhifa",
    heading: "Le temps d'accomplissement de la Wadhifa",
    content: `La Wadhifa n'est obligatoire qu'une fois par jour et méritoire deux fois par jour. Si elle est accomplie deux fois par jour, elle a les mêmes temps d'accomplissements que le Lazim pour le matin et le soir.

Si elle n'est accomplie qu'une fois par jour, alors son temps va du 'Asr d'un jour jusqu'au 'Asr de l'autre jour, et son temps de nécessité s'étend jusqu'au Maghreb de cet autre jour, et le meilleur moment pour l'accomplir dans ce cas est de le faire après le Maghreb. C'est ainsi qu'agissait Seïdina Ahmed Tidjani (qu'Allah sanctifie son précieux secret) à la fin de sa vie.`,
  },
];
