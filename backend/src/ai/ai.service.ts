import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ParsedSearchQuery {
  marque?: string;
  categorie?: string;
  motsCles: string[];
}

export interface DemandeAnalysis {
  typePiece?: string;
  marqueVehicule?: string;
  modeleVehicule?: string;
  motsCles: string[];
  resume: string;
}

/**
 * AiService
 *
 * Service centralisé pour communiquer avec un fournisseur
 * d'intelligence artificielle.
 *
 * Le fournisseur utilisé est défini dans le fichier .env
 * avec la variable AI_PROVIDER.
 *
 * Exemple :
 * AI_PROVIDER=gemini
 *
 * La clé API reste uniquement côté backend.
 * Elle n'est jamais envoyée directement au frontend.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Retourne le fournisseur d'IA actuellement utilisé.
   *
   * Gemini est utilisé par défaut.
   */
  private get provider(): 'openai' | 'gemini' {
    const provider = (
      this.config.get<string>('AI_PROVIDER') || 'gemini'
    ).toLowerCase();

    return provider === 'openai' ? 'openai' : 'gemini';
  }

  /**
   * Vérifie si la clé API nécessaire est disponible.
   */
  isConfigured(): boolean {
    if (this.provider === 'gemini') {
      return Boolean(this.config.get<string>('GEMINI_API_KEY'));
    }

    return Boolean(this.config.get<string>('OPENAI_API_KEY'));
  }

  // ==========================================================
  // Appel général à l'intelligence artificielle
  // ==========================================================

  /**
   * Envoie un prompt au fournisseur configuré.
   *
   * Retourne null si :
   * - aucune clé API n'est configurée ;
   * - le fournisseur retourne une erreur ;
   * - une erreur réseau se produit.
   *
   * Cela permet d'éviter de faire planter toute l'application.
   */
  async complete(
    prompt: string,
    opts: {
      system?: string;
      json?: boolean;
      maxTokens?: number;
    } = {},
  ): Promise<string | null> {
    if (!this.isConfigured()) {
      this.logger.warn(
        `Aucune clé API configurée pour le fournisseur "${this.provider}".`,
      );

      return null;
    }

    try {
      if (this.provider === 'gemini') {
        return await this.completeWithGemini(prompt, opts);
      }

      return await this.completeWithOpenAi(prompt, opts);
    } catch (error: any) {
      this.logger.error(
        `Erreur appel IA (${this.provider}) : ${error?.message || error}`,
      );

      return null;
    }
  }

  // ==========================================================
  // GEMINI
  // ==========================================================

  /**
   * Appel à l'API Google Gemini.
   */
  private async completeWithGemini(
    prompt: string,
    opts: {
      system?: string;
      json?: boolean;
      maxTokens?: number;
    },
  ): Promise<string | null> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY est absente du fichier .env.');

      return null;
    }

    /**
     * Modèle Gemini utilisé.
     *
     * Il peut être modifié directement dans le .env :
     *
     * GEMINI_MODEL=gemini-2.5-flash
     */
    const model = this.config.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    /**
     * Construction de la requête Gemini.
     */
    const requestBody: any = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],

      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: opts.maxTokens ?? 500,
      },
    };

    /**
     * Instruction système séparée.
     */
    if (opts.system) {
      requestBody.systemInstruction = {
        parts: [
          {
            text: opts.system,
          },
        ],
      };
    }

    /**
     * Lorsque l'application demande du JSON,
     * Gemini est configuré pour retourner uniquement du JSON.
     */
    if (opts.json) {
      requestBody.generationConfig.responseMimeType = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(requestBody),
    });

    /**
     * Gestion des erreurs Gemini.
     */
    if (!response.ok) {
      const errorText = await response.text();

      this.logger.error(`Gemini a répondu ${response.status} : ${errorText}`);

      return null;
    }

    const data: any = await response.json();

    /**
     * Récupération du texte généré.
     */
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      this.logger.warn(
        'Gemini a répondu mais aucun texte exploitable n’a été trouvé.',
      );

      return null;
    }

    return text.trim();
  }

  // ==========================================================
  // OPENAI
  // ==========================================================

  /**
   * Support OpenAI conservé pour permettre de changer
   * de fournisseur ultérieurement.
   */
  private async completeWithOpenAi(
    prompt: string,
    opts: {
      system?: string;
      json?: boolean;
      maxTokens?: number;
    },
  ): Promise<string | null> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY est absente du fichier .env.');

      return null;
    }

    const model = this.config.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';

    const messages: Array<{
      role: 'system' | 'user';
      content: string;
    }> = [];

    if (opts.system) {
      messages.push({
        role: 'system',
        content: opts.system,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },

      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: opts.maxTokens ?? 500,

        ...(opts.json
          ? {
              response_format: {
                type: 'json_object',
              },
            }
          : {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      this.logger.error(`OpenAI a répondu ${response.status} : ${errorText}`);

      return null;
    }

    const data: any = await response.json();

    return data?.choices?.[0]?.message?.content ?? null;
  }

  // ==========================================================
  // 1. CHATBOT
  // vv

  /**
   * Chatbot intelligent AutoParts.
   */
  async chat(
    history: ChatMessage[],
    contextInfo: string,
  ): Promise<string | null> {
    const system = `
Tu es l'assistant virtuel de "AutoParts",
une plateforme de vente de pièces automobiles.

Tu réponds toujours en français.

Tes réponses doivent être :
- claires ;
- simples ;
- professionnelles ;
- amicales ;
- courtes, maximum 5 phrases.

Tu aides les visiteurs à :
- rechercher des pièces automobiles ;
- comprendre les produits ;
- comprendre les commandes ;
- comprendre le paiement ;
- comprendre la livraison ;
- utiliser le panier ;
- effectuer une demande de pièce indisponible.

Tu ne dois jamais inventer une information.

Si une information précise n'est pas disponible,
propose au client d'utiliser le formulaire
"Demande de produit".

Voici les informations disponibles sur la plateforme :

${contextInfo || 'Aucune donnée supplémentaire disponible pour cette question.'}
`;

    const conversation = history
      .map(
        (message) =>
          `${
            message.role === 'user' ? 'Client' : 'Assistant'
          }: ${message.content}`,
      )
      .join('\n');

    return this.complete(conversation, {
      system,
      maxTokens: 400,
    });
  }

  // ==========================================================
  // 2. RECHERCHE INTELLIGENTE
  // ==========================================================

  /**
   * Analyse une recherche écrite en langage naturel
   * et extrait :
   * - la marque ;
   * - la catégorie ;
   * - les mots-clés.
   */
  async parseSearchQuery(
    query: string,
    knownCategories: string[],
    knownMarques: string[],
  ): Promise<ParsedSearchQuery | null> {
    const system = `
Tu extrais des critères de recherche structurés
à partir d'une phrase décrivant une pièce automobile.

Réponds UNIQUEMENT avec un objet JSON valide.

Format exact :

{
  "marque": string|null,
  "categorie": string|null,
  "motsCles": string[]
}

Catégories connues :
${knownCategories.join(', ') || 'aucune'}

Marques connues :
${knownMarques.join(', ') || 'aucune'}

Si la marque ou la catégorie correspond à une valeur connue,
même approximativement, utilise exactement la valeur connue.

"motsCles" doit contenir les mots importants
décrivant la pièce recherchée.

Exemples :
"phare avant"
"alternateur"
"plaquettes de frein"
"filtre à huile"
`;

    const raw = await this.complete(query, {
      system,
      json: true,
      maxTokens: 200,
    });

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);

      return {
        marque: parsed.marque || undefined,

        categorie: parsed.categorie || undefined,

        motsCles: Array.isArray(parsed.motsCles) ? parsed.motsCles : [],
      };
    } catch {
      this.logger.warn(`Réponse IA non-JSON pour parseSearchQuery : ${raw}`);

      return null;
    }
  }

  // ==========================================================
  // 3. DESCRIPTION PRODUIT
  // ==========================================================

  /**
   * Génère une description professionnelle
   * pour un produit automobile.
   */
  async generateProductDescription(input: {
    nom: string;
    marque?: string;
    categorie?: string;
    etat?: string;
  }): Promise<string | null> {
    const system = `
Tu rédiges des fiches produits pour une plateforme
de vente de pièces automobiles.

Écris une description commerciale courte,
de 2 à 3 phrases.

La description doit être :
- claire ;
- professionnelle ;
- honnête ;
- naturelle.

N'invente aucune caractéristique technique
qui n'a pas été fournie.

N'utilise aucun emoji.
`;

    const prompt = `
Rédige la description du produit suivant :

Nom : ${input.nom}

Marque / compatibilité :
${input.marque || 'non précisée'}

Catégorie :
${input.categorie || 'non précisée'}

État :
${input.etat || 'non précisé'}
`;

    return this.complete(prompt, {
      system,
      maxTokens: 200,
    });
  }

  // ==========================================================
  // 4. ANALYSE D'UNE DEMANDE CLIENT
  // ==========================================================

  /**
   * Analyse une demande de pièce automobile
   * envoyée par un client.
   */
  async analyzeDemande(input: {
    marque?: string;
    categorie?: string;
    produit?: string;
    description?: string;
  }): Promise<DemandeAnalysis | null> {
    const system = `
Tu analyses une demande de pièce automobile
envoyée par un client.

Réponds UNIQUEMENT avec un objet JSON valide.

Format exact :

{
  "typePiece": string|null,
  "marqueVehicule": string|null,
  "modeleVehicule": string|null,
  "motsCles": string[],
  "resume": string
}

"resume" doit être une phrase courte
qui résume clairement la demande pour un vendeur.

Exemple :
"Phare avant pour Toyota Corolla 2018"
`;

    const prompt = `
Marque indiquée :
${input.marque || '-'}

Catégorie indiquée :
${input.categorie || '-'}

Produit recherché :
${input.produit || '-'}

Description libre du client :
${input.description || '-'}
`;

    const raw = await this.complete(prompt, {
      system,
      json: true,
      maxTokens: 250,
    });

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);

      return {
        typePiece: parsed.typePiece || undefined,

        marqueVehicule: parsed.marqueVehicule || undefined,

        modeleVehicule: parsed.modeleVehicule || undefined,

        motsCles: Array.isArray(parsed.motsCles) ? parsed.motsCles : [],

        resume: parsed.resume || (input.produit || '').trim(),
      };
    } catch {
      this.logger.warn(`Réponse IA non-JSON pour analyzeDemande : ${raw}`);

      return null;
    }
  }

  // ==========================================================
  // 5. SYNTHÈSE DES DEMANDES POUR L'ADMINISTRATEUR
  // ==========================================================

  /**
   * Génère une synthèse des demandes clients
   * pour aider l'administrateur à prendre des décisions.
   */
  async summarizeDemandInsights(stats: {
    topProduits: {
      nom: string;
      count: number;
    }[];

    topCategories: {
      nom: string;
      count: number;
    }[];

    topMarques: {
      nom: string;
      count: number;
    }[];

    nonNotifieesCount: number;
    totalCount: number;
  }): Promise<string | null> {
    const system = `
Tu es analyste e-commerce pour une plateforme
de vente de pièces automobiles.

À partir des statistiques fournies,
rédige une synthèse courte de 3 à 4 phrases
en français.

La synthèse est destinée à l'administrateur.

Elle doit :
- identifier les tendances importantes ;
- signaler les produits les plus demandés ;
- identifier les catégories ou marques importantes ;
- proposer une recommandation concrète
  concernant le stock ou les fournisseurs.

Ne crée aucune statistique qui n'est pas fournie.
`;

    const prompt = `
Total des demandes :
${stats.totalCount}

Demandes encore non satisfaites :
${stats.nonNotifieesCount}

Pièces les plus demandées :
${
  stats.topProduits
    .map((product) => `${product.nom} (${product.count})`)
    .join(', ') || 'aucune'
}

Catégories les plus demandées :
${
  stats.topCategories
    .map((category) => `${category.nom} (${category.count})`)
    .join(', ') || 'aucune'
}

Marques les plus demandées :
${
  stats.topMarques.map((brand) => `${brand.nom} (${brand.count})`).join(', ') ||
  'aucune'
}
`;

    return this.complete(prompt, {
      system,
      maxTokens: 250,
    });
  }
}
