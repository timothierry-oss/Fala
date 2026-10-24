import type { SlangCategory, SlangItem } from './types'

type S = Omit<SlangItem, 'id'>

const items: S[] = [
  // Salutations
  { pt: 'E aí?', fr: 'Quoi de neuf ? / Salut !', ex: 'E aí, cara, tudo certo?', exFr: 'Salut mec, tout va bien ?', category: 'Salutations', register: 'familier', region: 'Partout' },
  { pt: 'Beleza?', fr: 'Ça va ? / Ça marche', ex: 'Beleza, te vejo amanhã.', exFr: 'Ça marche, on se voit demain.', category: 'Salutations', register: 'familier', region: 'Partout', note: 'Sert à la fois de « ça va ? » et de « d’accord ».' },
  { pt: 'Tudo certo?', fr: 'Tout roule ?', ex: '— Tudo certo? — Tudo certo!', exFr: '— Tout roule ? — Tout roule !', category: 'Salutations', register: 'familier', region: 'Partout' },
  { pt: 'Valeu!', fr: 'Merci ! / Ça marche !', ex: 'Valeu pela carona!', exFr: "Merci de m'avoir déposé !", category: 'Salutations', register: 'familier', region: 'Partout' },
  { pt: 'Falou!', fr: 'Salut ! (en partant) / OK', ex: 'Falou, até mais!', exFr: 'Allez, salut, à plus !', category: 'Salutations', register: 'familier', region: 'Partout' },
  { pt: 'Firmeza?', fr: 'Ça va ? / Carré', ex: 'Firmeza, mano? Tudo em ordem?', exFr: 'Ça va, frérot ? Tout est en ordre ?', category: 'Salutations', register: 'très familier', region: 'São Paulo' },

  // Réactions
  { pt: 'Nossa!', fr: 'Waouh ! / Oh là là !', ex: 'Nossa, que lindo!', exFr: "Waouh, c'est magnifique !", category: 'Réactions', register: 'familier', region: 'Partout', note: 'Abréviation de « Nossa Senhora » (Notre-Dame).' },
  { pt: 'Caramba!', fr: 'Mince ! / Purée !', ex: 'Caramba, esqueci a chave!', exFr: "Mince, j'ai oublié la clé !", category: 'Réactions', register: 'familier', region: 'Partout' },
  { pt: 'Que saco!', fr: 'Quelle barbe ! / Ça me saoule', ex: 'Que saco, o ônibus atrasou de novo.', exFr: 'Ça me saoule, le bus est encore en retard.', category: 'Réactions', register: 'très familier', region: 'Partout' },
  { pt: 'Fala sério!', fr: 'Sérieux ?! / Arrête !', ex: 'Fala sério! Você ganhou na loteria?', exFr: 'Sérieux ?! Tu as gagné au loto ?', category: 'Réactions', register: 'familier', region: 'Partout' },
  { pt: 'Massa!', fr: 'Génial !', ex: 'Essa música é massa!', exFr: 'Cette chanson est géniale !', category: 'Réactions', register: 'familier', region: 'Nordeste & Brasília' },
  { pt: 'Show (de bola)!', fr: 'Super !', ex: 'Show! Então está combinado.', exFr: "Super ! C'est donc décidé.", category: 'Réactions', register: 'familier', region: 'Partout' },
  { pt: 'Legal', fr: 'Cool, sympa', ex: 'Seu amigo é muito legal.', exFr: 'Ton ami est vraiment sympa.', category: 'Réactions', register: 'familier', region: 'Partout' },
  { pt: 'Pô', fr: 'Bah / Ben / Oh', ex: 'Pô, cara, chegou atrasado de novo?', exFr: 'Oh mec, t’es encore en retard ?', category: 'Réactions', register: 'familier', region: 'Rio de Janeiro' },

  // Personnes
  { pt: 'Cara', fr: 'Mec / Gars', ex: 'Cara, que filme incrível!', exFr: 'Mec, quel film incroyable !', category: 'Personnes', register: 'familier', region: 'Partout' },
  { pt: 'Mano / Mina', fr: 'Frérot / Meuf', ex: 'Mano, você viu isso?', exFr: 'Frérot, tu as vu ça ?', category: 'Personnes', register: 'très familier', region: 'São Paulo' },
  { pt: 'Gato / Gata', fr: 'Beau gosse / Jolie fille', ex: 'Ele é muito gato!', exFr: 'Il est trop beau !', category: 'Personnes', register: 'familier', region: 'Partout' },
  { pt: 'A galera', fr: 'La bande, tout le monde', ex: 'A galera vai pro bar depois da aula.', exFr: 'La bande va au bar après le cours.', category: 'Personnes', register: 'familier', region: 'Partout' },
  { pt: 'A gente', fr: 'On / Nous', ex: 'A gente se vê amanhã!', exFr: 'On se voit demain !', category: 'Personnes', register: 'familier', region: 'Partout', note: 'Remplace « nós » dans la langue parlée. Le verbe se conjugue à la 3ᵉ personne du singulier.' },

  // Sorties
  { pt: 'Bora! / Partiu!', fr: 'On y va ! / Allez !', ex: 'Partiu praia!', exFr: 'Direction la plage !', category: 'Sorties', register: 'familier', region: 'Partout' },
  { pt: 'Rolê', fr: 'Sortie, virée', ex: 'Vamos dar um rolê no centro?', exFr: 'On va faire un tour en ville ?', category: 'Sorties', register: 'familier', region: 'São Paulo' },
  { pt: 'Balada', fr: 'Soirée, boîte de nuit', ex: 'Ontem a balada foi até as cinco.', exFr: "Hier, la soirée a duré jusqu'à cinq heures.", category: 'Sorties', register: 'familier', region: 'São Paulo' },
  { pt: 'Ficar (com alguém)', fr: 'Sortir avec quelqu’un (sans engagement)', ex: 'Eles ficaram na festa.', exFr: 'Ils se sont embrassés à la fête.', category: 'Sorties', register: 'familier', region: 'Partout' },
  { pt: 'Zoar', fr: 'Se moquer, déconner', ex: 'Calma, tô só zoando!', exFr: 'Calme-toi, je déconne !', category: 'Sorties', register: 'familier', region: 'Partout' },

  // Au quotidien
  { pt: 'Tô', fr: 'Je suis (contraction de « estou »)', ex: 'Tô cansado hoje.', exFr: "Je suis fatigué aujourd'hui.", category: 'Au quotidien', register: 'familier', region: 'Partout' },
  { pt: 'De boa', fr: 'Tranquille, pas de souci', ex: 'Tô de boa, pode ir sem mim.', exFr: 'Je suis tranquille, vas-y sans moi.', category: 'Au quotidien', register: 'familier', region: 'Partout' },
  { pt: 'Mó', fr: 'Trop, super (de « maior »)', ex: 'Tá mó calor hoje.', exFr: "Il fait trop chaud aujourd'hui.", category: 'Au quotidien', register: 'très familier', region: 'São Paulo & Rio' },
  { pt: 'Grana', fr: 'Fric, thunes', ex: 'Tô sem grana esse mês.', exFr: "Je suis à sec ce mois-ci.", category: 'Au quotidien', register: 'familier', region: 'Partout' },
  { pt: 'Busão', fr: 'Le bus', ex: 'Vou pegar o busão.', exFr: 'Je vais prendre le bus.', category: 'Au quotidien', register: 'familier', region: 'Partout' },
  { pt: 'Rapidinho', fr: 'Vite fait', ex: 'Espera rapidinho!', exFr: 'Attends deux secondes !', category: 'Au quotidien', register: 'familier', region: 'Partout' },
  { pt: 'Tipo', fr: 'Genre (tic de langage)', ex: 'Ele é, tipo, muito engraçado.', exFr: 'Il est, genre, super drôle.', category: 'Au quotidien', register: 'familier', region: 'Partout' },
  { pt: 'Treta', fr: 'Embrouille, dispute', ex: 'Deu treta no grupo da família.', exFr: "Il y a eu de l'embrouille dans le groupe de la famille.", category: 'Au quotidien', register: 'très familier', region: 'Partout' },
  { pt: 'Jeitinho', fr: "L'art de se débrouiller", ex: 'Dá um jeitinho, por favor!', exFr: "Trouve une solution, s'il te plaît !", category: 'Au quotidien', register: 'familier', region: 'Partout', note: 'Le « jeitinho brasileiro » est un trait culturel : contourner les obstacles avec créativité.' },

  // SMS & internet
  { pt: 'kkkkk', fr: 'mdr', ex: 'kkkkk muito bom!', exFr: 'mdr trop bien !', category: 'SMS & internet', register: 'familier', region: 'Partout', note: 'Plus il y a de « k », plus on rit. « rsrs » est plus discret.' },
  { pt: 'vc / tb / blz', fr: 'você / também / beleza', ex: 'vc vem tb? blz', exFr: 'tu viens aussi ? ok', category: 'SMS & internet', register: 'familier', region: 'Partout' },
  { pt: 'pfv / vlw', fr: 'por favor / valeu', ex: 'me manda o endereço pfv. vlw!', exFr: "envoie-moi l'adresse stp. merci !", category: 'SMS & internet', register: 'familier', region: 'Partout' },
  { pt: 'Zap', fr: 'WhatsApp', ex: 'Me chama no zap!', exFr: 'Écris-moi sur WhatsApp !', category: 'SMS & internet', register: 'familier', region: 'Partout' },
]

export const slang: SlangItem[] = items.map((s, i) => ({ ...s, id: `giria-${i}` }))

export const slangCategories: SlangCategory[] = [
  'Salutations',
  'Réactions',
  'Personnes',
  'Sorties',
  'Au quotidien',
  'SMS & internet',
]
