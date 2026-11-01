// ============================================================
//  3e ÉTAGE — scénario (langage ink)
//  Doc ink : https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md
//
//  Locuteurs :  moi: ...   -> le perso que tu incarnes (Pierre ou Pierre-Louis)
//               coloc: ... -> l'autre coloc
//               romane: / sofia: / anna: / mathilde:
//               (sans préfixe) -> narration
//  Tags :  # bg: toit   # show: romane happy   # hide: romane   # clear
//          (# show: moi blush  change l'expression de TON avatar)
//
//  Fonctionnement :
//   - Chaque knot se termine par -> DONE : le jeu revient alors en exploration.
//   - Parler à quelqu'un lance le knot talk_<clé> (voir src/world.js pour qui est où).
//   - Entrer dans une pièce lance on_enter (événements de pièce).
//   - « Finir la journée » (appart 3B) lance day_end -> soirée du jour.
// ============================================================

VAR player = "pierre"      // "pierre" ou "pl" — choisi au début
VAR day = 1
VAR location = "appart_gars"
VAR game_over = false
VAR ending_title = ""

// Affinités
VAR aff_coloc = 0
VAR aff_romane = 0
VAR aff_sofia = 0
VAR aff_anna = 0
VAR aff_mathilde = 0

// Dernier jour où on a parlé à chacun (1 vraie discussion par jour)
VAR talked_coloc = 0
VAR talked_romane = 0
VAR talked_sofia = 0
VAR talked_anna = 0
VAR talked_mathilde = 0

// Arcs
VAR insiste_anna = 0         // Pierre qui s'accroche...
VAR respect_anna = false     // ... ou qui lâche prise
VAR respect_mathilde = false // Pierre-Louis qui laisse de l'espace à Mathilde
VAR colis = 0                // quête du colis : 0 rien, 1 en poche, 2 livré, 3 ignoré

-> intro

=== function coloc_name ===
{ player == "pierre":
    ~ return "Pierre-Louis"
}
~ return "Pierre"

=== function moi_name ===
{ player == "pierre":
    ~ return "Pierre"
}
~ return "Pierre-Louis"

// ============================================================
//  INTRO
// ============================================================
=== intro ===
# bg: appart_gars
Semaine 9 de l'échange à Montréal. Appartement 3B, troisième étage. Dehors, la neige recouvre les escaliers en colimaçon.
# show: coloc happy
coloc: Debout ! Il est midi. On avait dit qu'on profitait de Montréal.
# show: moi awkward
moi: On en profite. Horizontalement.
coloc: Romane a écrit dans le groupe. Grosse soirée étudiante à McGill ce soir, on y va.
{ player == "pierre":
    moi: ...Anna sera là ?
    # show: coloc awkward
    coloc: Mec. Elle t'a dit non. Plusieurs fois. Avec des mots différents, mais non.
    moi: Elle a dit « pas maintenant ». C'est pas pareil.
    coloc: C'est exactement pareil.
- else:
    moi: ...Mathilde sera là ?
    # show: coloc awkward
    coloc: Probablement. Elle t'évite depuis deux semaines, tu comptes faire quoi ?
    moi: Survivre, déjà.
}
# show: coloc neutral
coloc: Bon. Fais un tour dans l'immeuble, passe voir les voisines. Celles du 3C... et celles du 3D. On part ce soir.
# clear
💡 Clique au sol pour marcher, sur une porte pour changer de pièce, et sur quelqu'un pour lui parler. Ensuite, écris-lui ce que tu veux ! Pour passer à la soirée, va dormir dans ton lit au 3B.
-> DONE

// ============================================================
//  ÉVÉNEMENTS DE PIÈCE
// ============================================================
=== on_enter ===
{ location == "hall" && day == 2 && colis == 0:
    -> hall_colis
}
-> DONE

=== hall_colis ===
# show: moi surprised
Un colis traîne au pied des boîtes aux lettres. L'étiquette indique « Romane, app. 3C ».
* [Le prendre pour le lui apporter]
    ~ colis = 1
    # show: moi happy
    moi: Livraison spéciale, service porte-à-porte. Elle va m'adorer.
* [Le laisser là]
    ~ colis = 3
    moi: Pas mon colis, pas mon problème.
- -> DONE

// ============================================================
//  FIN DE JOURNÉE
// ============================================================
=== day_end ===
{ day:
- 1: -> soiree_mcgill
- 2: -> soiree_jeux
- else: -> soiree_toit
}

// ============================================================
//  CONVERSATIONS — LE COLOC
// ============================================================
=== talk_coloc ===
{ talked_coloc == day:
    coloc: {~Va voir les autres, je suis occupé à ne rien faire.|T'as pas des voisines à aller voir ?|Laisse-moi, je finis mon épisode.}
    -> DONE
}
~ talked_coloc = day
{ day:
- 1: -> j1
- 2: -> j2
- else: -> j3
}
= j1
coloc: Tu te rends compte qu'il nous reste à peine un mois et demi ici ?
coloc: Après, retour à l'école, les partiels, la grisaille...
* [« Alors on rend ce mois-ci légendaire. »]
    ~ aff_coloc += 2
    # show: coloc happy
    coloc: Voilà ! C'est ça, l'esprit de l'échange.
* [« Arrête, tu me déprimes. »]
    # show: coloc awkward
    coloc: Pardon, pardon. Je retourne à mes pâtes.
- -> DONE
= j2
coloc: La machine a mangé une chaussette. Encore. Je crois qu'elle les collectionne.
{ player == "pierre":
    -> j2_pierre
- else:
    -> j2_pl
}
= j2_pierre
# show: coloc neutral
coloc: Et toi, hier soir avec Anna... t'étais pas obligé de lui proposer de danser plusieurs fois.
* [« T'as raison. Je vais lui lâcher la grappe. »]
    ~ aff_coloc += 2
    ~ respect_anna = true
    # show: coloc happy
    coloc: Enfin ! Je suis fier de toi. Sérieusement.
* [« Elle a souri à la fin. C'est un signe. »]
    ~ insiste_anna += 1
    # show: coloc awkward
    coloc: C'était un sourire gêné, Pierre. Le sourire de quelqu'un qui cherche la sortie de secours.
- -> DONE
= j2_pl
# show: coloc neutral
coloc: Et toi, Mathilde t'a esquivé toute la soirée. Elle a changé de pièce genre trois fois.
* [« Je vais la laisser tranquille. Si elle veut parler, elle viendra. »]
    ~ aff_coloc += 2
    ~ respect_mathilde = true
    # show: coloc happy
    coloc: Sage. Très sage. Qui es-tu et qu'as-tu fait de mon coloc ?
* [« Je vais aller lui parler, crever l'abcès. »]
    # show: coloc awkward
    coloc: Hmm. Vas-y doucement, alors. Elle a été claire.
- -> DONE
= j3
coloc: Ce soir, c'est la soirée sur le toit. La dernière grosse soirée avant les partiels.
# show: coloc blush
coloc: Peu importe comment ça se passe avec les filles... merci d'être mon coloc, {moi_name()}.
* [« Pareil. Meilleur binôme depuis l'école. »]
    ~ aff_coloc += 2
    # show: coloc happy
    coloc: On a survécu aux TP d'électronique, on survivra à Montréal.
* [« Deviens pas sentimental, ça me fait peur. »]
    ~ aff_coloc += 1
    coloc: Trop tard. C'est l'hiver québécois, ça rend émotif.
- -> DONE

// ============================================================
//  CONVERSATIONS — ROMANE
// ============================================================
=== talk_romane ===
{ talked_romane == day:
    # show: romane happy
    romane: {~Je file, j'ai un truc à organiser !|Toi encore ? Tu m'espionnes ou quoi ?|On se voit plus tard !}
    -> DONE
}
~ talked_romane = day
{ day:
- 1: -> j1
- 2: -> j2
- else: -> j3
}
= j1
# show: romane happy
Romane scotche une affiche fluo sur le mur du couloir.
romane: Hé, le voisin ! Tu viens ce soir ? J'ai mis des affiches dans tout le campus.
romane: S'il y a moins de 200 personnes, je déménage.
* [« Évidemment. Tes soirées sont les meilleures de McGill. »]
    ~ aff_romane += 2
    # show: romane blush
    romane: Arrête, je vais prendre la grosse tête... Non, continue en fait.
* [« Ça dépend. Y aura de la poutine ? »]
    ~ aff_romane += 1
    romane: Il y a TOUJOURS de la poutine. On n'est pas des sauvages.
* [« Je sais pas, je suis crevé. »]
    # show: romane angry
    romane: Crevé ? En échange ? À Montréal ? Je refuse d'entendre ça.
- -> DONE
= j2
{ colis == 1:
    ~ colis = 2
    ~ aff_romane += 2
    # show: romane surprised
    moi: J'ai trouvé ça en bas, c'est à ton nom.
    romane: Mes bouquins de droit ! Tu me sauves la vie, je les attendais depuis deux semaines !
    # show: romane happy
    romane: Tu sais que t'es le meilleur voisin de l'immeuble ?
}
# show: romane neutral
romane: Ce soir, soirée jeux de société chez nous. Anna et Mathilde viennent aussi.
{ player == "pierre":
    romane: Et... Anna m'a parlé d'hier. Elle aimerait que tu la laisses un peu respirer.
- else:
    romane: Et... Mathilde est encore un peu mal à l'aise avec toi. Rien de grave, mais vas-y doucement, OK ?
}
* [« Message reçu. Je ferai attention. »]
    ~ aff_romane += 1
    # show: romane happy
    romane: Merci. C'est pour ça qu'on vous aime bien, vous deux.
* [« Elle peut me le dire elle-même, non ? »]
    ~ aff_romane -= 1
    # show: romane angry
    romane: Elle te l'a dit. Moi, je te le répète. C'est le principe d'une amie.
- -> DONE
= j3
# show: romane neutral
Romane fouille sa boîte aux lettres, l'air pensif.
romane: Je pensais à un truc. Vous repartez dans un mois et demi. C'est nul. Je m'étais habituée à vous.
* [« Tu pourrais venir nous voir à Paris. »]
    ~ aff_romane += 2
    # show: romane blush
    romane: ...Tu m'invites ? Fais attention, je pourrais dire oui.
* [« On a encore le temps de faire plein de trucs. »]
    ~ aff_romane += 1
    # show: romane happy
    romane: T'as raison. Liste de choses à faire avant votre départ. Je m'en occupe.
- -> DONE

// ============================================================
//  CONVERSATIONS — SOFIA
// ============================================================
=== talk_sofia ===
{ talked_sofia == day:
    sofia: {~Chut, je suis au meilleur chapitre.|On a déjà parlé aujourd'hui. Mon quota social est presque vide.|Hm ? Ah, salut.}
    -> DONE
}
~ talked_sofia = day
{ day:
- 1: -> j1
- 2: -> j2
- else: -> j3
}
= j1
Sofia lit, assise sur une machine à laver en plein essorage.
sofia: Le cycle essorage, c'est le meilleur massage gratuit de Montréal.
* [S'asseoir sur la machine d'à côté]
    ~ aff_sofia += 2
    # show: sofia happy
    sofia: Ah, un connaisseur. Tu peux rester.
* [« Tu lis quoi ? »]
    ~ aff_sofia += 1
    sofia: Un bouquin sur l'architecture des villes nordiques. Passionnant. Enfin, pour moi.
* [« C'est un peu bizarre, non ? »]
    # show: sofia awkward
    sofia: Bizarre, c'est mon deuxième prénom. Le premier, c'est Sofia.
- -> DONE
= j2
# show: sofia happy
Sofia est sur le toit, emmitouflée dans une couverture, un thermos à la main.
sofia: Personne ne monte jamais ici l'hiver. C'est mon endroit secret. Enfin, c'était.
sofia: Regarde, on voit la croix du mont Royal d'ici.
* [« C'est magnifique. Merci de me le montrer. »]
    ~ aff_sofia += 2
    # show: sofia blush
    sofia: Je te l'ai pas montré. T'es venu tout seul. ...Mais de rien.
* [« Il fait moins quinze. T'es folle. »]
    ~ aff_sofia += 1
    sofia: Moins quinze, c'est le printemps ici. Tiens, prends un peu de chocolat chaud.
- -> DONE
= j3
# show: sofia neutral
sofia: Anna squatte ma chambre, elle cherche une robe pour ce soir. Ça peut durer trois heures.
{ player == "pierre" && insiste_anna > 0 && not respect_anna:
    # show: sofia awkward
    sofia: Et sans vouloir me mêler de tes affaires... elle aimerait vraiment que tu passes à autre chose.
}
sofia: Toi, tu montes sur le toit ce soir ?
* [« Seulement si t'y es. »]
    ~ aff_sofia += 2
    # show: sofia blush
    sofia: ...C'est ma terrasse. Évidemment que j'y serai.
* [« Ouais, toute la bande y sera. »]
    ~ aff_sofia += 1
    sofia: Cool. Ça va être une belle soirée.
- -> DONE

// ============================================================
//  CONVERSATIONS — ANNA
// ============================================================
=== talk_anna ===
{ talked_anna == day:
    anna: {~On a déjà parlé tout à l'heure !|Je suis un peu occupée, là.|À ce soir !}
    -> DONE
}
~ talked_anna = day
{ player == "pierre":
    { day:
    - 1: -> pierre_j1
    - 2: -> pierre_j2
    - else: -> pierre_j3
    }
- else:
    { day:
    - 1: -> pl_j1
    - 2: -> pl_j2
    - else: -> pl_j3
    }
}
= pierre_j1
# show: anna awkward
Anna sort du 3D, son manteau sur le bras. Elle s'arrête net en te voyant.
anna: Ah. Salut, Pierre.
* [« Salut ! Tu viens à McGill ce soir ? »]
    # show: anna neutral
    anna: Oui, avec les filles. On se verra là-bas. En groupe.
* [« Je pensais justement à toi... »]
    ~ insiste_anna += 1
    ~ aff_anna -= 1
    # show: anna awkward
    anna: Pierre... on en a déjà parlé.
- -> DONE
= pl_j1
# show: anna happy
anna: Pierre-Louis ! Vous venez ce soir, j'espère ? Romane a menacé de déménager sinon.
* [« Évidemment, on sera là. »]
    ~ aff_anna += 1
    anna: Parfait. Et prépare ta voix, il paraît qu'il y a un karaoké.
* [« Mathilde sera là ? »]
    # show: anna awkward
    anna: Oui... Elle préfère garder ses distances, tu sais. Laisse-lui de l'air, d'accord ?
- -> DONE
= pierre_j2
# show: anna awkward
Anna rentre avec des sacs de courses, les joues rougies par le froid.
anna: Oh. Salut, Pierre.
moi: Salut ! Je t'aide à porter tes sacs ? Et après on pourrait aller boire un café, juste nous deux...
# show: anna neutral
anna: Pierre. Je t'aime bien, vraiment. Mais ce qui s'est passé entre nous, c'était une fois. Je veux pas plus.
* [« D'accord. Je comprends, et je vais respecter ça. »]
    ~ respect_anna = true
    ~ aff_anna += 3
    # show: anna happy
    anna: Merci. Sérieusement, ça me soulage.
    anna: Et du coup oui, tu peux porter les sacs. En ami.
* [« Laisse-moi juste une chance de te faire changer d'avis. »]
    ~ insiste_anna += 1
    ~ aff_anna -= 2
    # show: anna angry
    anna: Non. C'est exactement ça que je te demande d'arrêter.
    Anna monte l'escalier avec ses sacs, sans se retourner.
- -> DONE
= pierre_j3
{ respect_anna:
    -> pierre_j3_ami
}
# show: anna neutral
anna: Pierre, je vais être claire une dernière fois. On n'est pas ensemble, et on ne le sera pas.
anna: Si tu continues, je vais arrêter de venir quand t'es là. Et j'ai pas envie, j'adore Romane et Sofia.
* [« Pardon. J'ai été lourd. J'arrête là. »]
    ~ respect_anna = true
    ~ aff_anna += 2
    # show: anna happy
    anna: Merci. Ça compte, que tu le dises.
* [Ne rien répondre]
    ~ insiste_anna += 1
    anna: Bon. Je vais retrouver les filles.
- -> DONE
= pierre_j3_ami
# show: anna happy
anna: Pierre ! Viens m'aider. La robe verte ou la noire pour ce soir ?
anna: Et je veux un avis d'ami honnête.
* [« La verte. Sans hésiter. »]
    ~ aff_anna += 1
    anna: C'est ce que Sofia a dit ! Deux voix contre une, adjugé.
* [« Je suis nul en mode, demande à Sofia. »]
    anna: Haha, honnête au moins.
- -> DONE
= pl_j2
# show: anna happy
Anna rentre avec des sacs de courses, les joues rougies par le froid.
anna: Pierre-Louis ! Tu tombes bien. Ton coloc... il va bien ?
anna: Je l'aime bien, mais j'ai l'impression qu'il comprend pas quand je dis non.
* [« Je vais lui parler. Il doit te laisser tranquille. »]
    ~ aff_anna += 2
    anna: Merci. T'es un bon pote, toi.
* [« Il est maladroit, mais il est pas méchant. »]
    ~ aff_anna += 1
    # show: anna neutral
    anna: Je sais. Mais maladroit ou pas, j'ai dit non.
- anna: Et toi, avec Mathilde ? Elle m'a dit qu'elle préférait garder ses distances.
* [« Je sais. Je vais respecter ça. »]
    ~ respect_mathilde = true
    ~ aff_anna += 1
    # show: anna happy
    anna: Bonne réponse. Elle va apprécier.
* [« Je comprends pas ce que j'ai fait de mal... »]
    # show: anna neutral
    anna: Rien de mal, je crois. Elle a juste pas envie. C'est tout, et c'est OK.
- -> DONE
= pl_j3
# show: anna happy
anna: J'hésite entre deux robes pour ce soir. T'en penses quoi, la verte ou la noire ?
* [« La verte. »]
    ~ aff_anna += 1
    anna: Deux voix pour la verte ! Adjugé.
* [« La noire. »]
    anna: Hmm, Sofia a dit la verte... Je vais tirer à pile ou face.
- -> DONE

// ============================================================
//  CONVERSATIONS — MATHILDE
// ============================================================
=== talk_mathilde ===
{ talked_mathilde == day:
    mathilde: {~On s'est déjà parlé, non ?|Je suis occupée, désolée.}
    -> DONE
}
~ talked_mathilde = day
{ player == "pl":
    { day:
    - 1: -> pl_j1
    - 2: -> pl_j2
    - else: -> pl_j3
    }
- else:
    { day:
    - 1: -> pierre_j1
    - 2: -> pierre_j2
    - else: -> pierre_j3
    }
}
= pierre_j1
# show: mathilde happy
Mathilde fait des étirements sur le toit, en doudoune, malgré le froid.
mathilde: Pierre ! Tu viens courir avec moi demain ? Six heures, mont Royal.
* [« Six heures du matin ?! Avec plaisir... je crois. »]
    ~ aff_mathilde += 2
    mathilde: J'adore la motivation tremblante. On verra si tu te lèves.
* [« Je suis plutôt team grasse mat'. »]
    # show: mathilde neutral
    mathilde: Dommage. La vue au lever du soleil, ça vaut le coup.
- -> DONE
= pl_j1
# show: mathilde awkward
Mathilde fait des étirements sur le toit. Elle se fige en te voyant arriver.
mathilde: Oh. Pierre-Louis. Je... je finissais.
* [« Je te laisse, j'étais juste venu voir la vue. »]
    ~ respect_mathilde = true
    ~ aff_mathilde += 1
    # show: mathilde neutral
    mathilde: ...OK. Merci.
* [« On peut parler de l'autre soir ? »]
    ~ aff_mathilde -= 1
    # show: mathilde angry
    mathilde: Non. Vraiment pas. À ce soir.
- -> DONE
= pl_j2
{ respect_mathilde:
    -> pl_j2_calme
}
# show: mathilde awkward
mathilde: Pierre-Louis. Je... j'allais partir, en fait.
* [« Attends, on peut parler deux minutes ? »]
    ~ aff_mathilde -= 1
    # show: mathilde angry
    mathilde: Je t'ai déjà dit que je préférais qu'on en reste là. En parler, ça change rien.
    mathilde: ...Je vais aider Romane en cuisine.
* [« Pas de souci. Je te laisse. »]
    ~ respect_mathilde = true
    ~ aff_mathilde += 2
    # show: mathilde neutral
    mathilde: ...Merci.
- -> DONE
= pl_j2_calme
# show: mathilde neutral
Mathilde lève les yeux de son téléphone, surprise que tu te contentes d'un petit signe de la main.
mathilde: ...Salut.
moi: Salut. Je voulais juste te dire, pas de souci pour l'autre fois. Je te laisse tranquille.
# show: mathilde happy
mathilde: Oh. Merci. C'est... cool de ta part. Vraiment.
~ aff_mathilde += 3
-> DONE
= pl_j3
# show: mathilde neutral
Mathilde accroche des guirlandes lumineuses sur la rambarde du toit.
{ respect_mathilde:
    -> pl_j3_ami
}
mathilde: Je préférerais finir ça seule, si ça te dérange pas.
* [« Bien sûr. Bonne soirée, Mathilde. »]
    ~ respect_mathilde = true
    ~ aff_mathilde += 1
    mathilde: Merci. À ce soir.
* [Rester quand même]
    ~ aff_mathilde -= 2
    # show: mathilde angry
    mathilde: Sérieusement ?
    Elle range les guirlandes et redescend.
- -> DONE
= pl_j3_ami
mathilde: Tu peux tenir l'autre bout ? ...Si tu veux.
* [Tenir la guirlande en silence]
    ~ aff_mathilde += 2
    # show: mathilde happy
    mathilde: Merci. Tu sais, je t'en veux pas. J'avais juste besoin d'espace.
    mathilde: On peut être potes. Pour de vrai.
* [« Avec plaisir. »]
    ~ aff_mathilde += 1
    mathilde: Parfait. Plus haut... voilà.
- -> DONE
= pierre_j2
# show: mathilde happy
mathilde: Pierre ! Je cherche un coéquipier pour le Dixit de ce soir. Romane triche, j'en suis sûre.
* [« Je suis ton homme. »]
    ~ aff_mathilde += 2
    mathilde: Parfait. On va les détruire.
* [« Désolé, je fais équipe avec Sofia. »]
    ~ aff_sofia += 1
    # show: mathilde surprised
    mathilde: Oh ? « Avec Sofia » ? Intéressant...
- -> DONE
= pierre_j3
# show: mathilde neutral
Mathilde accroche des guirlandes lumineuses sur la rambarde du toit.
mathilde: Dis, ton coloc. Il est sympa, hein. Tu peux lui dire que tout va bien de mon côté ? Juste, je veux pas plus.
* [« Je lui dirai. Il comprendra. »]
    ~ aff_mathilde += 2
    # show: mathilde happy
    mathilde: Merci. T'es plus mature que ta réputation le laisse croire.
* [« Ironique, venant de moi, avec Anna... »]
    ~ aff_mathilde += 1
    # show: mathilde happy
    mathilde: Haha ! Au moins t'en as conscience. C'est un début.
- -> DONE

// ============================================================
//  SOIRÉE 1 — McGILL
// ============================================================
=== soiree_mcgill ===
# clear
# bg: soiree_mcgill
22 h, une salle du campus de McGill. La musique fait vibrer le sol. Romane a tenu sa promesse, il y a au moins 200 personnes.
# show: romane happy
romane: VOUS ÊTES VENUS ! Les Français sont dans la place !
# show: coloc happy
coloc: On t'avait promis.
# show: sofia neutral
sofia: Je vous préviens, je reste une heure. Maximum. ...Bon, deux.
# clear
Au fond de la salle, tu repères Anna et Mathilde près du bar.
{ player == "pierre":
    -> pierre
- else:
    -> pl
}
= pierre
# show: anna neutral
anna: Oh. Salut, Pierre.
* [Lui faire un signe et rejoindre la bande]
    ~ respect_anna = true
    ~ aff_anna += 1
    # show: anna happy
    anna: Bonne soirée !
* [Lui proposer de danser]
    moi: Tu viens danser ?
    anna: Euh... non merci, je suis bien ici.
    ** [Insister. « Allez, juste une ! »]
        ~ insiste_anna += 2
        ~ aff_anna -= 2
        # show: anna angry
        anna: Pierre. J'ai dit non.
        Mathilde l'entraîne vers la piste, loin de toi.
        # show: coloc awkward
        coloc: ...On va chercher de la poutine ? Ça te changera les idées.
    ** [« OK, pas de souci, bonne soirée ! »]
        # show: anna happy
        anna: Merci. Profite bien !
- -> karaoke
= pl
# show: mathilde awkward
mathilde: ...Ah. Pierre-Louis. Salut.
Elle détourne les yeux et part vers la piste de danse.
* [La laisser partir]
    ~ respect_mathilde = true
    ~ aff_mathilde += 1
    # show: coloc happy
    coloc: Bien joué. Allez, viens, on a une soirée à vivre.
* [La suivre pour lui parler]
    ~ aff_mathilde -= 1
    Mathilde change de pièce. Puis encore. Puis une troisième fois.
    # show: coloc awkward
    coloc: Mec. Message reçu, non ?
- -> karaoke
= karaoke
# clear
# show: romane happy
romane: OK TOUT LE MONDE, KARAOKÉ !
# show: sofia awkward
sofia: Non. Non non non.
* [Chanter en duo avec Romane]
    ~ aff_romane += 2
    # show: romane happy
    Vous massacrez un classique de Céline Dion à deux voix. La salle est en délire.
    romane: On est des légendes. Officiellement.
* [Rester au fond avec Sofia à noter les prestations]
    ~ aff_sofia += 2
    # show: sofia happy
    sofia: Six sur dix pour la justesse, dix sur dix pour la confiance.
    sofia: T'es drôle quand tu fais le jury, toi.
* [Danser avec {coloc_name()}]
    ~ aff_coloc += 2
    # show: coloc happy
    coloc: LA CHORÉE D'INTÉGRATION ! Comme en première année !
- -> retour
= retour
# clear
# bg: couloir
3 h du matin. Vous remontez au 3e, les oreilles qui sifflent.
~ day = 2
~ location = "appart_gars"
☀️ Jour 2, vendredi. Le soleil se reflète sur la neige.
-> DONE

// ============================================================
//  SOIRÉE 2 — JEUX CHEZ ROMANE & SOFIA
// ============================================================
=== soiree_jeux ===
# clear
# bg: appart_filles
Soirée jeux au 3C. Il y a des chips, du thé, et une tension palpable autour du Dixit.
# show: romane happy
# show: sofia neutral
romane: Règle numéro un, pas de triche. Règle numéro deux, c'est moi qui gagne.
{ player == "pierre":
    -> pierre
- else:
    -> pl
}
= pierre
# show: anna neutral
Anna arrive avec Mathilde et s'installe à l'autre bout de la table.
{ respect_anna:
    -> pierre_ok
}
* [Lui laisser de l'espace et te concentrer sur le jeu]
    ~ respect_anna = true
    ~ aff_anna += 1
    Anna se détend petit à petit et finit par rire à tes blagues. Comme une amie.
* [Changer de place pour t'asseoir à côté d'elle]
    ~ insiste_anna += 1
    ~ aff_anna -= 2
    ~ aff_romane -= 1
    ~ aff_sofia -= 1
    # show: anna angry
    anna: Pierre... sérieusement ?
    # show: sofia awkward
    sofia: On pourrait... refaire les équipes, peut-être ?
- -> jeu
= pierre_ok
# show: anna happy
anna: Pierre, tu me passes les chips ? Merci !
Elle te sourit, détendue. L'ambiance est légère.
-> jeu
= pl
# show: mathilde awkward
Mathilde arrive avec Anna. Elle salue tout le monde, et toi d'un petit signe distant.
{ respect_mathilde:
    -> pl_ok
}
* [Lui laisser de l'espace]
    ~ respect_mathilde = true
    ~ aff_mathilde += 1
    La soirée avance, et Mathilde finit par se détendre.
* [Faire une blague sur « la dernière fois »]
    ~ aff_mathilde -= 2
    ~ aff_romane -= 1
    # show: mathilde angry
    mathilde: Pas drôle.
    Un silence gênant tombe sur la table.
- -> jeu
= pl_ok
# show: mathilde neutral
mathilde: T'es dans l'équipe de Sofia ? OK. Préparez-vous à perdre.
Elle te lance un petit sourire. La glace commence à fondre.
~ aff_mathilde += 1
-> jeu
= jeu
# clear
# show: romane happy
# show: sofia happy
Le Dixit tourne au combat de titans. Romane accuse tout le monde de tricher.
* [Faire équipe avec Romane]
    ~ aff_romane += 2
    romane: On forme la meilleure équipe de l'histoire du Dixit !
* [Faire équipe avec Sofia]
    ~ aff_sofia += 2
    sofia: Bon choix. Je lis dans les pensées, c'est connu.
- -> retour
= retour
# clear
# bg: couloir
Minuit passé. Tu retraverses le couloir jusqu'au 3B.
~ day = 3
~ location = "appart_gars"
☀️ Jour 3, samedi. Ce soir, soirée sur le toit.
-> DONE

// ============================================================
//  SOIRÉE 3 — LE TOIT (FINALE)
// ============================================================
=== soiree_toit ===
# clear
# bg: toit
Soirée sur le toit. Les guirlandes de Mathilde brillent, la croix du mont Royal veille sur la ville.
# show: romane happy
# show: sofia happy
# show: coloc happy
romane: À l'échange ! Et à ceux qui repartent trop tôt !
coloc: À Montréal !
sofia: Au toit. Mon toit.
# clear
{ player == "pierre":
    -> pierre
- else:
    -> pl
}
= pierre
{ respect_anna:
    # show: anna happy
    anna: Pierre ! On trinque ? À l'amitié, la vraie.
    Tu trinques avec Anna. C'est simple, sans malaise. Et étrangement, ça fait du bien.
- else:
    Anna discute avec les autres, à l'opposé du toit. Elle évite ton regard toute la soirée.
    # show: coloc awkward
    coloc: Tu sais ce qui serait classe ? Lui laisser la paix. Pour de bon.
}
-> rambarde
= pl
{ respect_mathilde:
    # show: mathilde happy
    mathilde: Pierre-Louis ! Les guirlandes tiennent, t'as vu ? Santé, l'ami.
    Vous trinquez. Pas de malaise. Juste deux potes sur un toit.
- else:
    Mathilde reste avec Anna, à l'autre bout du toit. Elle ne te regarde pas.
    # show: coloc awkward
    coloc: Tu sais ce qui serait classe ? La laisser tranquille. Pour de bon.
}
-> rambarde
= rambarde
# clear
Plus tard, la soirée se calme. Tu t'approches de la rambarde pour regarder la ville.
-> fin

=== fin ===
~ game_over = true
~ temp best = best_romance()
{
- best == "romane":
    -> fin_romane
- best == "sofia":
    -> fin_sofia
- best == "anna":
    -> fin_anna
- best == "mathilde":
    -> fin_mathilde
- else:
    -> fin_amis
}

// Qui a le plus d'affinité, parmi celles qui sont prêtes ?
// Anna (pour Pierre) et Mathilde (pour Pierre-Louis) demandent plus :
// il faut avoir respecté leur choix ET atteindre 8.
=== function best_romance ===
~ temp best = "aucune"
~ temp score = 0
{ aff_romane >= 5 && aff_romane > score:
    ~ best = "romane"
    ~ score = aff_romane
}
{ aff_sofia >= 5 && aff_sofia > score:
    ~ best = "sofia"
    ~ score = aff_sofia
}
{ anna_prete() && aff_anna > score:
    ~ best = "anna"
    ~ score = aff_anna
}
{ mathilde_prete() && aff_mathilde > score:
    ~ best = "mathilde"
    ~ score = aff_mathilde
}
~ return best

=== function anna_prete ===
{ player == "pierre":
    ~ return aff_anna >= 8 && respect_anna && insiste_anna <= 1
}
~ return aff_anna >= 6

=== function mathilde_prete ===
{ player == "pl":
    ~ return aff_mathilde >= 8 && respect_mathilde
}
~ return aff_mathilde >= 6

=== fin_anna ===
~ ending_title = "Romance avec Anna"
# show: anna blush
Anna te rejoint à la rambarde, les mains dans les poches de son manteau.
{ player == "pierre":
    anna: Tu sais quoi, Pierre ? Quand t'as arrêté d'insister, j'ai enfin vu qui t'étais vraiment.
    anna: Et ce mec-là... je l'aime bien. Genre, vraiment bien.
- else:
    anna: Toi, t'es venu me parler comme à une personne, pas comme à un défi. C'est rare.
    anna: Ça te dit, un café demain ? Juste nous deux.
}
* [« Avec plaisir. »]
    # show: anna happy
    Elle sourit et pose la tête sur ton épaule. La croix du mont Royal brille au loin.
* [Lui sourire, sans un mot]
    anna: ...Je prends ça pour un oui.
- -> epilogue

=== fin_mathilde ===
~ ending_title = "Romance avec Mathilde"
# show: mathilde blush
Mathilde s'accoude à côté de toi, le nez rougi par le froid.
{ player == "pl":
    mathilde: J'avais besoin d'espace. Tu me l'as laissé. Et du coup... j'ai eu envie de revenir.
    mathilde: On recommence ? Doucement, cette fois.
- else:
    mathilde: Six heures demain, mont Royal. Et cette fois, t'as intérêt à te lever.
    mathilde: Après, je t'offre un café. C'est un rendez-vous, si tu veux.
}
* [« Oui. Doucement, mais oui. »]
    # show: mathilde happy
    Elle te donne un petit coup d'épaule. Vous restez là, à regarder la ville respirer.
* [« Je serai là. Promis. »]
    mathilde: T'as intérêt.
- -> epilogue

=== fin_romane ===
~ ending_title = "Romance avec Romane"
# show: romane blush
Romane te rejoint, un chocolat chaud dans chaque main.
romane: Tiens. Pour le meilleur voisin de l'immeuble.
romane: Tu sais... je crois que je vais vraiment venir te voir à Paris.
* [Lui prendre la main]
    # show: romane happy
    Elle ne retire pas sa main. Sous vos pieds, Montréal scintille.
* [« Promis ? »]
    romane: Promis. Et je tiens toujours mes promesses. Demande aux 200 personnes de jeudi.
- -> epilogue

=== fin_sofia ===
~ ending_title = "Romance avec Sofia"
# show: sofia neutral
Sofia est assise sur la glacière, sa couverture sur les épaules. Elle en soulève un coin pour te faire de la place.
sofia: Il reste de la place. Si tu veux.
* [T'asseoir sous la couverture avec elle]
    # show: sofia blush
    sofia: ...C'est la première fois que je partage mon toit. Et ma couverture.
    sofia: T'as de la chance, je partage jamais.
* [« On regarde la croix ensemble ? »]
    # show: sofia happy
    sofia: C'est exactement ce que j'allais te proposer.
- -> epilogue

=== fin_amis ===
~ ending_title = "La bande du 3e"
# show: coloc happy
coloc: Pas de grande histoire d'amour cette fois, hein ?
moi: Non. Mais une sacrée bande de potes.
coloc: C'est déjà énorme.
-> epilogue

=== epilogue ===
# clear
{ player == "pierre" && ending_title != "Romance avec Anna":
    { insiste_anna >= 2 && not respect_anna:
        📱 Notification. « Anna a restreint ton compte. » Certaines leçons s'apprennent à la dure.
    - else:
        Anna et toi restez en contact. Une vraie amitié est née de ce qui aurait pu rester gênant.
    }
}
{ player == "pl" && ending_title != "Romance avec Mathilde":
    { respect_mathilde:
        Mathilde t'envoie une photo du toit prise ce soir-là, avec la légende « les meilleurs voisins de Montréal ».
    - else:
        Mathilde a gardé ses distances. Avec le recul, tu comprends que c'était son droit.
    }
}
{ aff_coloc >= 4:
    Et avec {coloc_name()}, vous rentrerez en France plus soudés que jamais.
}
-> END
