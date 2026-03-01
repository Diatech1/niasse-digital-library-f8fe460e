export const priereShaykhIbrahimMeta = {
  title: "La prière (aṣ-ṣalāt) d'après le Šayḫ Ibrāhīm Niyās",
  author: "Šayḫ Fakhruddīn ibn Aḥmad at-Tijānī",
  translator: "Samīr at-Tijānī al-Ibrāhīmī al-Andalusī",
};

export interface PriereSection {
  id: string;
  chapter: string;
  heading: string;
  content: string;
}

export const priereShaykhIbrahimSections: PriereSection[] = [
  {
    id: "intro-1",
    chapter: "Introduction",
    heading: "Introduction",
    content: `La prière (ṣalāt) constitue le pilier le plus important de l'Islam. Il s'agit du fondement de la Šarīʿa, la base de la Ṭarīqa et la protection de la Ḥaqīqa. Elle constitue aussi le signe de la Maʿrifa, car il n'y a pas de foi sans prière.

Ṣāḥibu-l-Fayḍa le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – a dit dans son Dīwān intitulé Manāsik Ahli-l-Widād :

ﺷﺮﻳﻌﺔ درﻳﻨﺎ ﻣﺎ ﻧﺼﻠﻲ ﻛﺬاك

أمشﺦ ﻓﺎﻟﺸﺄن ﻗﻂ ﺻﻼة ﻣﻦ ﺧﻠﺖ

Nous aussi nous prions, puisque nous ne connaissons pas de religion qui ait négligé la prière. C'est là une affaire grandiose !

Notre ṣalāt muḥammadienne, répartie en cinq prières (fajr, ẓuhr, ʿaṣr, maġrib e ʿišāʾ), constitue la meilleure adoration prescrite à l'humanité. Le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – a dit dans le dernier Dīwān qu'il écrivit et qui porte le titre Sayru-l-Qalb :

ﺗﺮى وﻫﻞ ﻛﺎﻟﺼﻼة روح ﻗﻮت ﻫﻞ

ﺻﻔﺎ ملﻦ ﺻﻴﺎم أو ﻟﻄﻬﺮ ﻧﻈريا

ﺗﻮاﺿﻌﺎ ﻛﻌﻦ ﻓﻠرت ﻋﻠﻴﻚ

واﻟﺼﻔﺎ واﻟﻘﺮب اﻟﺘﻤﻜني ﺗﺮى ﻟﺮيب

ﺗﻜﻦ ﻓﻼ ﻳﺮاك أو ﺗﺮاﻩ ﻫﻨﺎك

ﻗﻔﺎ ﻗﻔﻦ ﺣﺬار ﺗﻨﻄﻖ ﻻ وﻳﻚ وﺻﻪ

Y a-t-il pour l'esprit nourriture semblable à la prière ? Vois-tu quelque chose de semblable à la pureté rituelle ou au jeûne pour celui qui se purifie ?

Réalise donc la prière et incline-toi humblement devant ton Seigneur. Tu obtiendras ainsi fermeté, proximité et pureté.

Ainsi tu Le verras ou mieux encore : Il te verra, car alors tu ne seras plus !

Sois tranquille et vigilant. Ne parle pas et renonce à prononcer mot quelconque.`,
  },
  {
    id: "intro-2",
    chapter: "Introduction",
    heading: "Les cinq présences divines",
    content: `Du point de vue de la ḥaqīqa, la ṣalāt n'est autre que Muḥammad. Le ʿĀrif complet contemple la manifestation des cinq présences (ḥaḍrāt) d'Allāh (Hahūt, Lāhūt, Jabarūt, Malakūt et Nāsūt) dans les cinq réalités de Muḥammad – qu'Allāh le bénisse et lui donne la paix ! – (Sirr, Rūḥ, ʿAql, Qalb et Nafs). D'un autre côté, ces cinq présences divines et ces cinq réalités prophétiques correspondent aux cinq prières canoniques quotidiennes. Et tout cela est refleté en nous au moyen du miroir de la Ḥaḍra du Sceau Caché (al-Ḫatm al-Katm).

Dans son Dīwān intitulé Ṭību-l-Anfās, dans lequel il énumère les Grâces que le Très-Haut lui a accordées, le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – compte la prière (ṣalāt) parmi ces dons :

ﺣﺎﻓﻈﺎ واخلﻤﺲ اخلﻤﺲ ﻧﻴﻠﻲ ﻛﺬﻟﻚ

املﺼﻨﻒ ﻫﺬا ﻧﻌﻢ مخﺲ و خلﻤﺲ

Parmi ces grâces, il y a ma réalisation des cinq (ḥaḍrāt) et des cinq (maqāmāt) par les cinq (arkān) et les cinq (ṣalāt). Quelle grâce a reçu ce serviteur !

Il faut dire que la prière constitue le cadre et la scène sur laquelle on récite la Parole d'Allāh le Très-Haut.

Parfois, le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – récitait tout le Saint Coran pendant ses prières nocturnes. Comme il dit dans son Dīwān intitulé Taysīru-l-Wuṣūl :

ﻛﺘﺎﺑﻪ أﺗﻠﻮ اﷲ ﻋﺒﺪ وإين

أﻗﺮط دﻫﺮي اﷲ رﺳﻮل وﺟﻨﺐ

وودﻩ ﺑﺎﻷﻣني ريب ﻓﺎﺷﻜﺮ

حيﻔﻆ اﻟﺪﻫﺮ ﻣﺪى ﻣﺪﺣﺎ ﺳﺄﺧﺪﻣﻪ

ﻟﻄﺎﻋيت داﻧﻮ اﷲ رﺟﺎل وإن

ﻣﻐﻠﻆ ﻋﺪر اﷲ ﺑﺮﺳﻮل ويل

Je suis le serviteur d'Allāh qui récite Son Livre et exalte toujours Son Prophète.

Je remercie mon Seigneur pour nous avoir envoyé al-Āmīn et pour mon amour pour lui, puisque je célèbre continuellement ses louanges et toujours le garde à l'esprit.

Les Gens d'Allāh se sont soumis à mon autorité et au Prophète moyennant mon solide bouclier.`,
  },
  {
    id: "intro-3",
    chapter: "Introduction",
    heading: "La prière est le moyen d'ascension des croyants",
    content: `Allāh le Très-Haut nous ordonne plus de 300 fois dans le Saint Coran de réaliser la ṣalāt. Ces prières bénies, répétées cinq fois par jour, nous ont été données par le biais de notre très-aimé Prophète Muḥammad – qu'Allāh le bénisse et lui donne la paix ! – lors de la Nuit du Miʿrāj au sein de la Présence Divine. Ainsi, quand on fait la prière, on s'élève et on atteint cette Présence. al-ḥamdu li-Llāh !

Le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – a clairement affirmé dans son Dīwān intitulé Sulwatu-š-Šujun :

ﺧﺒﻤﺴﺔ وواىف ﻟﻴﻼ املﺼﻄﻔﻰ ﺳﺮى

ﻟﻠﻤﺘﻘﺪم واﻟﻔﻀﻞ đﺎ ﻋﺮﺟﻨﺎ

L'Élu voyagea de nuit et revint avec cinq (prières) pour qu'on s'élève par elles, et le bénéfice est pour le premier qui les pria.

Le Prophète nous a recommandé de nous élever au moyen de la prière, car par elle le serviteur obtient tout bénéfice !

Pour Lui et par Lui, tu dois te lever et t'incliner humblement. Ainsi tu obtiendras ce qui réjouit tes yeux de la part du meilleur Bienfaiteur.

Quand tu te lèves pour réciter le Saint Coran après avoir fait le wuḍūʾ, quand tu te prosternes après le rukūʿ, toute la distance entre toi et Allāh disparaît, tu as atteint le Bien-aimé ! Récite le takbīr et honore-Le.

C'est pourquoi notre bien-aimé Prophète – qu'Allāh le bénisse et lui donne la paix ! – disait :

املﺆﻣﻨني ﻣﻌﺮاج اﻟﺼﻼة

La prière est le moyen d'ascension (miʿrāj) des croyants.

Quant à la noble Ṭarīqa Tijānīyya, il faut rappeler que le respect de la prière constitue une de ses conditions non négociables. En effet, on dit qu'il faut "réaliser les cinq prières quotidiennes dans leur temps imparti et en congrégation".

Comme dit le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – dans le poème Sulwatu-š-Šujun :

ﺷﻐﻠﻬﻢ ﺑﺎﻟﻠﻴﻞ اﻟﻨﺎس ﻛﺒﺎر ﻓﺈن أﺧﻠﺼﺎ اﻟﻜﻞ ﺗﺮى أوراد و ﻛﻮع ر

Les hommes les plus grands passent leurs nuits à s'incliner et à réciter leurs litanies. Tu les verras tous dans leur sincérité.

Le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – a aussi dit dans son poème intitulé al-Kibrītu-l-Aḥmar :

ﻟﻜﻔﺮ إمنﺤﺎء ﻃﺎﻟﺒﺎ أﺳﺠﺪ شﻜﺮي ﻓﻴﺠﻞ ﻗﻄﺮ ﻛﻞ يف

Je me prosterne en cherchant la disparition de l'incrédulité (kufr), dans toutes les régions. C'est pourquoi je me dois d'être reconnaissant !`,
  },
  {
    id: "intro-4",
    chapter: "Introduction",
    heading: "La ponctualité dans la prière",
    content: `Et dans le poème Rūḥu-l-Adab, le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – exhorte ainsi ses disciples :

اخلﻄﻰ ﻧﻘﻞ ﺧﻔﻴﺔ ﻛﻌﺘﺎن ور اخلﻄﺎ ﻳﻜﻔﺮ املﺴﺎﺟﺪ إىل

Réalisez deux rakʿa en secret et marchez vers les mosquées pour prier. Tout cela purifiera vos péchés.

En fait, la ponctualité des Maîtres et des disciples tijānīs au moment de faire la prière en tout lieu, a été une des choses qui m'a attiré le plus dans la Ṭarīqa Tijāniyya. Cet aspect a été fondamental, parce que j'avais vu de nombreux membres et Maîtres d'autres voies spirituelles qui n'accordaient pas d'importance à la ṣalāt, ce qui me surprenait toujours.

al-ḥamdu li-Llāh ! Notre Maître le Šayḫ Ḥasan Cissé – qu'Allāh soit satisfait de lui ! – passa toute sa vie à réaliser ses prières en congrégation, même le dernier jour de sa vie, où il dirigea les cinq prières canoniques dans la Grande Mosquée de Médina Baye. Ensuite il rentra chez lui et mourut.

Il ne fit en tout cela rien d'autre que suivre les pas du Messager d'Allāh – qu'Allāh le bénisse et lui donne la paix ! –, du Šayḫ Aḥmad at-Tijānī – qu'Allāh soit satisfait de lui ! – et de son grand-père Šayḫu-l-Islām Ibrāhīm Niyās – qu'Allāh soit satisfait de lui !

Comme a dit le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – dans son Dīwān intitulé Nūru-l-Ḥaqq :

ﻣﺴﻠﻜﻲ واحلﻨﻴﻔﺔ ﺑﺮيب رﺿﻴﺖ أختﻠﻒ ﻻ اﷲ رﺳﻮل إﻣﺎﻣﻲ

ﻗﺒﻠيت اﻟﺒﻴﺖ و اﷲ رﺳﻮل دﻟﻴﻠﻲ ﻧﻄﻮف احلﺮام ﺑﺎﻟﺒﻴﺖ و ﻧﺼﻮم

وإﻧﻨﺎ راﻛﻌني ﺳﺠﻮدا ﻧﺼﻠﻲ ﻧﺘﻌﺴﻒ ﻻ اﻟﺪﻫﺮ درﺟﻨﺎ ذا ﻋﻠﻰ

Je suis satisfait de mon Seigneur et de la ḥanīfiyya (l'Islam) comme chemin. Mon Imām est le Messager d'Allāh, et jamais je ne lui tournerai le dos.

Mon guide est le Messager d'Allāh et la Maison d'Allāh est ma qibla. Nous jeûnons et nous réalisons nos circonvolutions autour de la Maison Sainte.

Et nous prions, en nous prosternant et en nous inclinant. C'est ce que nous avons toujours fait et on ne se lassera jamais.`,
  },
  {
    id: "intro-5",
    chapter: "Introduction",
    heading: "Prier dans les mosquées",
    content: `La première chose que fit le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – en arrivant dans la ville de Médina Baye, fut d'y établir la Grande Mosquée orientée vers la Mecque et de désigner un Imām chargé de diriger les prières : Sīdī ʿAlī Cissé – qu'Allāh soit satisfait de lui ! Exceptées les prières du Jour du Vendredi et celles de l'ʿĪd, le Šayḫ Ibrāhīm Niyās priait ses cinq prières derrière Sīdī ʿAlī Cissé – qu'Allāh soit satisfait avec tous deux !

Notre professeur le Šayḫ Baye Hayba de Mauritanie nous a rapporté que son père lui raconta qu'une fois ils étaient assis dans la mosquée avec le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – en attendant que Sīdī ʿAlī Cissé vienne diriger la prière. Mais l'Imām tardait à venir. Dans l'assemblée se trouvait le jeune Šayḫ Ḥasan Cissé – qu'Allāh soit satisfait de lui ! –, qui venait d'arriver d'Angleterre. Il portait un costume et une cravate. Alors le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – le désigna pour passer devant tout le monde et diriger la prière. A ce moment-là, certains Muqaddams assis avec le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – furent profondément surpris de voir un jeune homme en costume cravate s'avançant pour diriger la prière. Le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – les regarda et leur récita ces vers de l'Imām aš-Šāfiʿī – qu'Allāh soit satisfait de lui ! :

ﻋﺮﺿﻪ ﺑﺎﻟﻠﺆم ﻳﺪﻧﺲ مل املﺮء إذا ﺟﻤﻴﻞ ﻳﺮﺗﺪﻳﻪ ﻟﺒﺎس ﻓﻜﻞ

Si quelqu'un ne dégrade pas sa réputation par un mauvais comportement, alors tout vêtement lui convient !

De même, Mawlānā Šayḫ Aḥmad at-Tijānī – qu'Allāh soit satisfait de lui ! – n'avait pas l'habitude de diriger lui-même les prières. Normalement, il désignait Sīdī Muḥammad al-Mišrī – qu'Allāh soit satisfait de lui ! – ou Mawlay Muḥammad ibn Abī-n-Naṣr – qu'Allāh soit satisfait de lui ! – pour diriger la prière à sa place.

مقبولة عليه املفتوح خلف والصلاة ! عليه مفتوح رجل

C'est un homme qui a atteint l'illumination, et la prière derrière quelqu'un qui a atteint l'illumination est acceptée ! (Voir le livre Kashfu-l-Ḥijāb du Šayḫ Aḥmad Sukayrij)`,
  },
  {
    id: "intro-6",
    chapter: "Introduction",
    heading: "Les dernières prières des Maîtres",
    content: `La prière du fajr fut la dernière prière de sayyidnā Rasūl-Llāh – qu'Allāh le bénisse et lui donne la paix ! –, tout comme elle fut aussi la dernière prière de sayyidnā le Šayḫ at-Tijānī – qu'Allāh soit satisfait de lui ! Quant au Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! –, sa dernière prière fut celle du ʿaṣr. Et la dernière prière du Šayḫ Ḥasan – qu'Allāh soit satisfait de lui ! – fut celle du ʿišāʾ.

Le Šayḫ Ḥasan – qu'Allāh soit satisfait de lui ! – nous a informé que même paralysé et hospitalisé au St Thomas Hospital de Londres pendant ses derniers jours, le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – continuait de faire ses prières avec ses yeux et ses doigts. Quand le Šayḫ Ḥasan – qu'Allāh soit satisfait de lui ! – le vit dans cet état, il lui rappela l'opinion de l'école mālikī selon laquelle la prière n'est plus obligatoire pour une personne malade qui ne peut même pas s'asseoir. Le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – lui répondit : "Oui, je connais cette opinion de l'école mālikī. Cependant, nous sommes aussi tijānīs, et cela exige de nous plus d'obligations". Ainsi, le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – réalisa ses prières et ses litanies dans le lit de l'hôpital, jusqu'à ses derniers soupirs.

Il faut rappeler par ailleurs que la construction et l'établissement de mosquées constitue une pratique importante de la voie tijāniyya et de l'Islam en général, car le Seigneur de la Existence – qu'Allāh le bénisse et lui donne la paix ! – a dit à propos de la foi :

Si vous voyez un homme fréquentant les mosquées, témoignez de sa foi (transmis par at-Tirmīḏī)

Le Prophète – qu'Allāh le bénisse et lui donne la paix ! – nous a également informés qu'une telle personne sera parmi les élus se trouvant sous l'ombre d'Allāh le Jour où il n'y aura d'autre ombre que la Sienne.

Partant, on doit prier dans les mosquées, sans tenir compte de ceux qui dirigent les prières, tant qu'on ne les pas directement entendus insulter ou mépriser ouvertement le Šayḫ at-Tijānī – qu'Allāh soit satisfait de lui ! –, et s'ils le font, il ne nous est plus permis de prier derrière eux.

On dit aussi qu'une fois un Savant de Mauritanie visita Baye – qu'Allāh soit satisfait de lui ! – à Kaolack. Quand l'heure de la prière arriva, Baye lui demanda de la diriger. Cependant, ses disciples mauritaniens montrèrent leur mécontement, en disant : "De retour en Mauritanie, ce Savant reprendra de plus belle ses attaques contre la Fayḍa Tijāniyya". En entendant cela, Sīdī ʿAlī Cissé – qu'Allāh soit satisfait de lui ! – leur dit : "Quant à moi, il me suffit que Baye l'ait désigné pour diriger la prière". Alors il se plaça derrière l'Imām et les Mauritaniens imitèrent son geste.`,
  },
  {
    id: "priere-1",
    chapter: "La prière du Šayḫ Ibrāhīm",
    heading: "La servitude totale",
    content: `Voici décrite succintement la façon dont le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – réalisait la prière.

Intérieurement, il était le complet serviteur d'Allāh (ʿabd Allāh) et tout son être se trouvait dans un état de pure et totale servitude devant l'Être d'Allāh. Il disait :

ﻗﻂ ﻏريﻫﺎ ﻳﺴرتﻗين مل اﻹهلﻴﺔ احلﻀﺮة ﻋﺒﺪ وإين

Je suis le serviteur de la Présence Divine et je n'ai jamais été le serviteur d'autre que Lui (Voir Jawāhiru-r-Rasāʾil de Baye, Partie 1)

Cette servitude totale n'est possible que lorsque l'être du serviteur s'est éteint à lui-même et qu'il ne contemple que l'Être et les Actions de Celui qui est véritablement. En ce sens, la prière n'est qu'une modalité de son Ordre éternel. Rien d'elle ne nous appartient.

D'un autre côté, on peut dire que la prière n'est rien de plus que Sa Miséricorde. Baye – qu'Allāh soit satisfait de lui ! – a dit dans son Dīwān intitulé Nūru-l-Ḥaqq :

ﻓﺎﻟﻮﺛﺎﺋﻖ أﺛﻖ مل وﺣﺠﻲ ﺑﺼﻮﻣﻲ

احلﻘﺎﺋﻖ ﺗﺒﻠﻰ ﻳﻮم ﻛﺮمي ﺑﻔﻀﻞ

ﺗﺎﻟﻴﺎ اﷲ أذﻛﺮ إﻣﺘﺜﺎﻻ أﺻﻠﻲ

ذاﺋﻖ ﺗﺒﺼﺮ إن ﺷﻲء مث وﻣﺎ

Je ne place pas ma confiance dans mon jeûne ou mon pèlerinage, mais je place ma confiance dans la Grâce du Très-Généreux le Jour de la Résurrection.

Je prie et j'invoque Allāh en respectant ses Ordres, car il n'y a que Lui aux yeux du connaisseur qui a goûté à la connaissance.

Quant aux aspects extérieurs de la ṣalāt, le Šayḫ Ibrāhīm Niyās – qu'Allāh soit satisfait de lui ! – suivait de façon générale l'école mālikī, de même que la plupart de Musulmans africains.`,
  },
  {
    id: "priere-2",
    chapter: "La prière du Šayḫ Ibrāhīm",
    heading: "Les sunnas préférées par le Šayḫ",
    content: `Cependant, sur certaines questions, il exerçait sa capacité interprétative (ijtihād) et réalisait ce qu'il considérait être la pratique préférée du Messager d'Allāh – qu'Allāh le bénisse et lui donne la paix ! –, même quand cela s'opposait à l'opinion de l'école mālikī.

Certaines des sunnas qu'il préféra à l'opinion mālikī sont :

1. Prendre le poignet gauche dans la main droite (qabḍ), au lieu de laisser tomber les bras le long du corps.
2. Placer les mains sur la poitrine (mais pas trop haut comme font certains Salafīs).
3. Réciter la basmala à voix haute avant la Fātiḥa.
4. Ne pas faire de pause après la récitation de la basmala, mais lier la basmala au verset suivant de la Fātiḥa.
5. Dire Āmīne à voix haute, contrairement à l'opinion de l'école mālikī.
6. Lever les bras (rafʿu-l-yadayn) avant le rukūʿ.
7. Lever les bras (rafʿu-l-yadayn) quand on se lève après le rukūʿ.
8. Lever le doigt quand on dit la šahāda dans le tašahhud et le maintenir levé jusqu'à la fin de la prière (sans le bouger comme font les Salafīs).
9. Faire deux salām au lieu du salām unique des Mālikīs.
10. Réciter "qad qāmati-ṣ-ṣalāt" deux fois au lieu d'une dans l'iqāma.

La plupart de ces points ont été mentionnés dans le livre de Baye intitulé Rafʿu-l-Malām et traitant du fiqh de la prière.

Le point 8 a été expliqué par Baye à son bien-aimé Calife mauritanien Sīdī aš-Šayḫān – que Allāh soit satisfait avec tous deux ! –, qui lui demanda : "Comment le Prophète – qu'Allāh le bénisse et lui donne la paix ! – bougeait-il son doigt pendant le tašahhud ?".

Alors Baye – qu'Allāh soit satisfait de lui ! – lui répondit : "Je suis vraiment très heureux que quelqu'un me demande cela, car beaucoup de fois les gens ne me demandent que de l'argent".`,
  },
  {
    id: "priere-3",
    chapter: "La prière du Šayḫ Ibrāhīm",
    heading: "Suivre le Prophète dans la prière",
    content: `Et dans son Dīwān intitulé Manāsik Ahli-l-Widād, le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – affirme clairement qu'il prie exactement de la même façon que son bien-aimé le Prophète Muḥammad – qu'Allāh le bénisse et lui donne la paix ! :

حمﻤﺪا ﻳﻬﻮى إﺑﺮاﻫﻴﻢ وذﻟﻚ ﻣﻮﻗﻊ ﻏري اﻟﻜﻮن وﺟﻮد وأﻣﺮ

ﻣﺼﻠﻴﺎ اﻟﻨيب ﻛﺎن ﻛﻤﺎ ﻧﺼﻠﻲ ﻣﻘﻔﻊ ﺳﺒﻴﻞ ﻧﻘﻔﻮ ﻛﺬا ﻧﺼﻮم

ﺻﺮاﻃﻪ ﻧﺮﻳﺪ ﻧﺒﻘﻲ ﻻ وﻧﻨﻔﻖ املﺘﺒﻊ اهلﺎمشﻲ ﻛﺤﺞ حنﺞ

C'est pourquoi Ibrāhīm aime passionément Muḥammad, depuis un temps où l'Univers n'existait même pas.

Nous prions comme le Prophète avait l'habitude de prier, et nous jeûnons de même, en suivant le chemin du Maître.

Nous dépensons jusqu'à n'avoir plus rien, en suivant son chemin, et nous réalisons le pèlerinage comme le faisait le Hachémite.

Et Baye – qu'Allāh soit satisfait de lui ! – a dit dans le même Dīwān :

حمﻤﺪ حلﺐ وﺗﺼﺮﻳﻔﻲ ﻓﺠﻤﻌﻲ يﺒﻮر ﺗﺮاﻩ ﻫﻞ ﺑﻴﻮﻋﻲ وﻓﻴﻪ

ﺑﺎﻃﻼ اﷲ ﺧﻼ ﻣﺎ ﺷﻲء ﻛﻞ أرى ﻧﺼري وﻫﻮ اﻟﻨﺼﺮ وﻣﺎ

Tu verras que toutes mes actions suivent celles de Muḥammad, et mon état et ma vigilance pointent vers lui.

Ma réunion et mon autorité ne sont que par l'amour de Muḥammad, parce que je n'ai de rapport qu'avec lui. Comment pourrais-je perdre alors ?

Je vois tout ce qui est autre qu'Allāh comme faux, et il n'y a de victoire si ce n'est par Lui, car c'est Lui qui confère la victoire.`,
  },
  {
    id: "priere-4",
    chapter: "La prière du Šayḫ Ibrāhīm",
    heading: "Le maḏhab et l'ijtihād",
    content: `Avant Baye, Mawlānā Šayḫ Aḥmad at-Tijānī – qu'Allāh soit satisfait de tous deux ! – pratiquait aussi certaines sunnas contraires à l'opinion majoritaire de l'école mālikī. Par exemple, le grand Šayḫ Abū Bakr ʿAtīq – qu'Allāh soit satisfait de lui ! – a mentionné que le Šayḫ at-Tijānī – qu'Allāh soit satisfait de lui ! – pria avec le qabḍ en Algérie.

Ainsi, de façon générale, le Šayḫ Aḥmad at-Tijānī et le Šayḫ Ibrāhīm – qu'Allāh soit satisfait avec tous deux ! – étaient mālikīs, puisqu'ils étaient des musulmans sunnites qui appartenaient à une des quatre écoles juridiques (maḏhab). En ce sens, ils ne firent pas exception à la règle.

Quant à nous, leurs disciples, il n'est pas exigé de nous que nous soyons mālikīs pour être de bons tijānīs. En effet, nos Maîtres ont indiqué tout le contraire. Il y a de centaines de milliers de Tijānīs en Indonésie qui sont Šāfiʿīs. Et moi-même je suis l'école ḥanafī dans presque toutes les questions.

Cependant, nous tijānīs devons suivre nos Maîtres dans les jugements spécifiques où ils ont exercé leur ijtihād, même quand cela va contre notre maḏhab.

Par exemple, le Šayḫ at-Tijānī – qu'Allāh soit satisfait de lui ! – recommanda fortement de réciter la basmala à voix haute avant la Fātiḥa. Même si cette sunna diffère de l'opinion majoritaire des mālikī et ḥanafī, on doit la suivre. Le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – ordonna à ses disciples, dont la plupart sont mālikīs, de prier avec les mains sur la poitrine. C'est pourquoi, même s'ils sont mālikīs et que cela va contre l'opinion la plus diffusée dans l'école mālikī, ils doivent le faire.

En fait, quand le Šayḫ Ibrāhīm reçut de la part d'Allāh, du Messager d'Allāh – qu'Allāh le bénisse et lui donne la paix ! – et du Šayḫ at-Tijānī – qu'Allāh soit satisfait de lui ! – l'ordre d'exiger à ses disciples de prier avec leurs mains sur la poitrine, beaucoup de gens en Afrique occidentale s'opposèrent à lui.

Ils lui disaient : "Mais ton père – qu'Allāh soit satisfait de lui ! – priait avec les bras le long du corps !". Et lui de répondre : "al-ḥamdu li-Llāh ! Allāh nous a ordonné de ne suivre que le Prophète – qu'Allāh le bénisse et lui donne la paix !".

Comme le Šayḫ Māḥī Cissé m'a dit, le Šayḫ at-Tijānī – qu'Allāh soit satisfait de lui ! – désirait pratiquer le qabḍ, mais il ne lui fut pas donné de recevoir l'autorisation pour cela, car il devait lutter sur d'autres fronts. C'est pourquoi le Šayḫ at-Tijānī ordonna au Šayḫ Ibrāhīm – qu'Allāh soit satisfait avec tous deux ! – de revivifier cette sunna parmi les Mālikīs.`,
  },
  {
    id: "priere-5",
    chapter: "La prière du Šayḫ Ibrāhīm",
    heading: "Le rang du mujtahid muṭlaq",
    content: `Par ailleurs, d'autres Saints et Savants Mālikīs ont pris leurs mains sur la poitrine pendant la prière (contrairement a l'opinion majoritaire de l'école), comme par exemple l'Imām Ibn ʿAbd al-Barr, Sīdī Aḥmad ibn Idrīs, Sīdī Muḥammad ibn ʿAlī as-Sanūsī, la famille Kattānī, la famille Ġumārī et beaucoup d'autres.

Tu dois savoir aussi que le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – était un Savant reconnu et complet dans toutes les sciences du Saint Coran et de la Sunna, ainsi que dans toutes les sciences dérivées. Il avait atteint le rang de mujtahid muṭlaq. Il dit lui-même :

أﻓﻬﻢ ﻳﻮﺟﺪ وﻻ واﻟﺴﻨﺔ اﻟﻜﺘﺎب اﻟﻈﺎﻫﺮ يف ﺷﻴﺨﻲ ﺷﻴﺨﺎن يل أن اﻋﻠﻢ

حلﻈﺔ ﻳﻔﺎرﻗين وﻻ اﻟﺘﺠﺎين اﻟﺸﻴﺦ اﻟﺒﺎﻃﻦ يف وﺷﻴﺦﻲ ﻣين ﻓﻴﻬﻤﺎ

Tu dois savoir que j'ai deux Maîtres : mon Šayḫ dans le ẓāhir (sciences extérieures du Dīn), c'est le Saint Coran et la Sunna, et personne ne les comprend mieux que moi (aujourd'hui). Quant à mon Šayḫ dans le bāṭin (sciences intérieures du Dīn), c'est le Šayḫ at-Tijānī, qui est continuellement présent avec moi.

Les Savants de la très réputée Université d'Al-Azhar au Caire ont attribué au Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – le titre de Šayḫu-l-Islām, en lui donnant aussi le privilège d'être le premier savant africain ayant dirigé la prière à la mosquée de l'Université d'al-Azhar.

De plus, il faut signaler que sans aucun doute, le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – accéda aux plus hauts degrés de la Qutbāniyya, c'est-à-dire qu'il était le Ġawṯ de son époque. Et pour le Ġawṯ, il n'est pas obligatoire de suivre un maḏhab dans tous ses détails, comme cela a été clairement établi par Sīdī ʿAbd al-ʿAzīz ad-Dabbāġ – qu'Allāh soit satisfait de lui ! – dans son Kitābu-l-Ibrīz :

Tu dois savoir – qu'Allāh se montre bon avec toi ! – que le Saint qui a atteint l'illumination majeure connaît ce qui est vrai et authentique, et partant ne se limite pas à un seul maḏhab. En fait, même si toutes les écoles juridiques disparaissaient, un tel homme pourrait revivifier la Šarīʿa. Et comment pourrait-il en être autre autrement, puisque le Prophète – qu'Allāh le bénisse et lui donne la paix ! – ne s'absente de sa présence à aucun instant, puisque sa contemplation d'Allāh ne cesse à aucun instant ?

ﺷﺎوﻳﺎ درك ﻋﻦ اﻷﻗﻄﺎب ﻗﺼﺮ ﻓﻘﺪ

Même les Pôles ont échoué au moment de comprendre ma station.

Partant, du point de vue de la Šarīʿa et de la Ṭarīqa, le Šayḫ Ibrāhīm Niyās – qu'Allāh soit satisfait de lui ! – ne se voyait nullement obligé de suivre une école juridique, mālikī ou autre, dans tous ses détails. Comme il le dit lui-même :

ملﺎﻟﻚ ممﺎﻟﻴﻚ ﻟﺴﻨﺎ وﻟﻜﻦ ﻣﺎﻟﻜﻴﺔ حنﻦ

Nous sommes mālikīs, mais nous ne sommes pas esclaves (mamālīk) de Mālik.`,
  },
  {
    id: "priere-6",
    chapter: "La prière du Šayḫ Ibrāhīm",
    heading: "Le respect des quatre écoles",
    content: `Une personne de son rang peut donc choisir parmi toutes les écoles juridiques les sunnas qui se conforment à la sunna finale du Prophète Muḥammad – qu'Allāh le bénisse et lui donne la paix ! –, selon le critère qui lui semble le plus adéquat.

Comme a également indiqué Baye dans son poème Manāsik :

وﻣﺬﻫيب ﺣﺒﻴيب ﻋﻦ ﺳﺄﻟﻮين وإن Aﺟﻴﺐ ﺣني اﷲ رﺳﻮل ﺟﻮايب

Et si on me demande à propos de mon bien-aimé et de mon école (maḏhab), ma réponse sera : le Messager d'Allāh – qu'Allāh le bénisse et lui donne la paix !

Cependant, le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – n'a jamais déclaré avoir formellement abandonné l'école mālikī. D'ailleurs, la plupart de ses pratiques islamiques se fondaient sur la méthodologie mālikī. Comme les véritables Savants, il croyait au besoin de réformer le maḏhab de l'intérieur, sans détruire le système des écoles juridiques, comme font aujourd'hui les Wahhābīs-Salafīs en prétendant qu'ils ne suivent aucun maḏhab.

Dans son Dīwān, le Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – montre un grand respect pour les quatre Imāms des écoles juridiques du Sunnisme et ne cesse de les louer. Il dit dans son poème Šifāʾu-l-Asqām :

Comment peut-on aimer autre que Muḥammad ? Car aimer autre que lui est aveuglement et corruption, excepté celui qui aime la Famille du Prophète et ses Compagnons. Et qui les aime par amour de la Vérité, et aime ceux qui les ont suivi dans toutes leurs affaires. Celui-là est véritable, et son amour est véritable.

Tels sont par exemple (l'Imām) Mālik, an-Nuʿmān (Abū Ḥanīfa), Aḥmad ibn Ḥanbal, et l'Imām aš-Šāfiʿī ; sans eux, les horizons seraient restés dans l'obscurité.

Tout comme Abū-l-ʿAbbās Aḥmad at-Tijānī, mon seigneur, et al-Junayd le cheminant sur la Voie, le noble.

Ô Seigneur ! Donne-moi un amour vrai pour eux et permets-moi de les suivre, et ne me laisse servir autre que Toi.

Je te demande de me faire hériter l'héritage complet d'eux tous aussi bien en actions qu'en caractère. Qu'ils soient les mêmes que les leurs !`,
  },
  {
    id: "priere-7",
    chapter: "La prière du Šayḫ Ibrāhīm",
    heading: "Avertissements et invocations finales",
    content: `L'objectif de Šayḫu-l-Islām – qu'Allāh soit satisfait de lui ! – était pratiquer l'Islām de la façon la plus complète et de donner une victoire éclatante au Dīn. Voici ce qu'affirme Baye dans son Manāsik en s'adressant aux Chrétiens :

Nous avons été bénis par la foi islamique, alors que vous avez été maudits avec votre Trinité. Ma foi héritera cette terre à votre insu !

Ma foi est la prière et le jeûne, l'obligation de la zakāt, le pèlerinage et le mariage. Cette religion durera pour toujours.

Cette religion a été établie par le Hashémite Ṭaha Muḥammad, aussi longtemps que je vivrai, je resterai fidèle à cette religion.

En dernier, écoutons les avertissements du Šayḫ Ibrāhīm Niyās – qu'Allāh soit satisfait de lui ! :

L'obligation la plus importante est la réalisation des cinq prières en congrégation dans leurs temps impartis et après s'être purifié avec de l'eau. Je suis toujours surpris de voir des gens qui prétendent se relier à Allāh et au Šayḫ at-Tijānī – qu'Allāh soit satisfait de lui ! –, et qui cependant négligent leur prière ou leur wuḍūʾ. De telles personnes devraient revenir à leur Seigneur en s'éteignant à eux-mêmes. Voilà qui est mieux pour vous ! (Jawāhiru-r-Rasāʾil, vol.1)

On conclue avec ce duʿāʾ du Šayḫ Ibrāhīm – qu'Allāh soit satisfait de lui ! – dans son Dīwān intitulé Miftāḥu-l-ʿAṭiyyah :

يﺴﺟﺪوﻧﺎو ﻗﺎﻣﻮا ﻟﺮđﻢ اﻟﺬﻳﻨﺎ ﻣﻦ ﻓﺎﺟﻠين رب ﻳﺎ

Ô Seigneur ! Fais que je sois de ceux qui se lèvent et se prostèrnent devant leur Seigneur.

Et mentionnons également ce duʿāʾ du Prophète Ibrāhīm – que la paix soit sur lui ! – comme il a été rapporté dans le Saint Coran :

دُﻋَﺎء وَﺗـَﻘَﺒﱠﻞ رَﺑـﱠﻨَﺎ ﱢﻳﱠيت ذُر وَﻣِﻦ ﱠﻼَة اﻟﺼ ﻣُﻘِﻴﻢ اﺟْﻌَﻠْين رَب ﱢ

Ô Seigneur, fais que moi et ma descendance soyons de ceux qui réalisent la prière ! Ô Seigneur, accepte mon invocation ! (Cor 13:40)

ĀMĪNE, ĀMĪNE, ĀMĪNE !

Serviteur de la Porte Tijāniyya Fakhruddin ibn Aḥmad at-Tijānī`,
  },
];
