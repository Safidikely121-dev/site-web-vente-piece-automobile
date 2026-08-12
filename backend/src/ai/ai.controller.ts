import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { AiSearchDto } from './dto/search.dto';
import { GenerateDescriptionDto } from './dto/generate-description.dto';

import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Demande } from '../demandes/demande.entity';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommercialAdminGuard } from '../auth/commercial-admin.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Demande)
    private readonly demandeRepository: Repository<Demande>,
  ) {}

  // Normalise une chaîne (retire accents, minuscules) pour des comparaisons robustes.
  private normalize(str: string): string {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // ==========================================================
  // 1) Chatbot intelligent — POST /api/ai/chat
  // ==========================================================
  @Post('chat')
  async chat(@Body() body: ChatDto) {
    const message = body.message;

    // Recherche légère de produits pertinents pour ancrer la réponse (RAG léger)
    const keyword = this.normalize(message);
    const allProducts = await this.productRepository.find({
      relations: ['category'],
      take: 200,
    });

    const matches = allProducts
      .filter((p) => {
        const haystack = this.normalize(
          `${p.nom} ${p.marque ?? ''} ${p.category?.name ?? ''} ${p.description ?? ''}`,
        );
        return keyword
          .split(/\s+/)
          .filter((w) => w.length > 2)
          .some((w) => haystack.includes(w));
      })
      .slice(0, 5);

    const contextInfo = matches.length
      ? matches
          .map(
            (p) =>
              `- ${p.nom} (${p.category?.name ?? 'catégorie inconnue'}, marque: ${
                p.marque ?? 'n/a'
              }, prix: ${p.prix}, état: ${p.etat})`,
          )
          .join('\n')
      : '';

    const history = body.history ?? [];
    const fullHistory = [
      ...history,
      { role: 'user' as const, content: message },
    ];

    const reply = await this.aiService.chat(fullHistory, contextInfo);

    if (reply) {
      return { reply, source: 'ai' as const };
    }

    // Repli sans IA configurée : réponse basique mais utile
    return {
      reply:
        matches.length > 0
          ? `Voici ce que j'ai trouvé pour "${message}" :\n` +
            matches.map((p) => `• ${p.nom} — ${p.prix}`).join('\n')
          : `Je n'ai pas pu contacter l'assistant IA pour le moment. Vous pouvez utiliser la recherche par catégorie/marque, ` +
            `ou remplir le formulaire "Demande de produit" si la pièce recherchée n'apparaît pas dans notre catalogue.`,
      source: 'fallback' as const,
    };
  }

  // ==========================================================
  // 2) Recherche intelligente — POST /api/ai/search
  // ==========================================================
  @Post('search')
  @UseGuards(OptionalJwtAuthGuard)
  async search(@Body() body: AiSearchDto, @Req() req: any) {
    const categories = await this.categoryRepository.find();
    const categoryNames = categories.map((c) => c.name);

    const allProducts = await this.productRepository.find({
      relations: ['category'],
    });
    const marqueNames = Array.from(
      new Set(allProducts.map((p) => p.marque).filter(Boolean) as string[]),
    );

    const parsed = await this.aiService.parseSearchQuery(
      body.query,
      categoryNames,
      marqueNames,
    );

    // Repli si l'IA n'est pas configurée : extraction naïve par mots-clés
    const interpreted = parsed ?? {
      marque: marqueNames.find((m) =>
        this.normalize(body.query).includes(this.normalize(m)),
      ),
      categorie: categoryNames.find((c) =>
        this.normalize(body.query).includes(this.normalize(c)),
      ),
      motsCles: body.query.split(/\s+/).filter((w) => w.length > 2),
    };

    const qMarque = interpreted.marque
      ? this.normalize(interpreted.marque)
      : undefined;
    const qCategorie = interpreted.categorie
      ? this.normalize(interpreted.categorie)
      : undefined;
    const motsCles = (interpreted.motsCles || []).map((w) => this.normalize(w));

    // Un vendeur connecté ne doit pas voir les produits des autres vendeurs.
    const isVendeur = req.user?.role === 'vendeur';

    const results = allProducts.filter((p) => {
      if (isVendeur && p.userId !== req.user.id) return false;
      if (qMarque && this.normalize(p.marque || '') !== qMarque) return false;
      if (qCategorie && this.normalize(p.category?.name || '') !== qCategorie) {
        return false;
      }
      if (motsCles.length === 0) return true;

      const haystack = this.normalize(
        `${p.nom} ${p.description ?? ''} ${p.sousCategorie ?? ''}`,
      );
      return motsCles.some((w) => haystack.includes(w));
    });

    return {
      interpreted,
      count: results.length,
      results,
    };
  }

  // ==========================================================
  // 3) Assistance vendeur : génération de description — POST /api/ai/generate-description
  // ==========================================================
  @Post('generate-description')
  @UseGuards(JwtAuthGuard)
  async generateDescription(
    @Body() body: GenerateDescriptionDto,
    @Req() req: any,
  ) {
    const role = req.user?.role;
    if (
      role !== 'vendeur' &&
      role !== 'admin_technique' &&
      role !== 'admin_commercial'
    ) {
      throw new ForbiddenException(
        'Seuls les vendeurs peuvent générer une description de produit.',
      );
    }

    const description = await this.aiService.generateProductDescription(body);

    if (description) {
      return { description, source: 'ai' as const };
    }

    // Repli simple, sans IA
    const parts = [
      body.nom,
      body.marque ? `compatible ${body.marque}` : undefined,
      body.categorie ? `catégorie ${body.categorie}` : undefined,
      body.etat ? `état : ${body.etat}` : undefined,
    ].filter(Boolean);

    return {
      description: `${parts.join(', ')}. Disponible sur AutoParts.`,
      source: 'fallback' as const,
    };
  }

  // ==========================================================
  // 5) Analyse des demandes clients — GET /api/ai/demandes/insights (admin)
  // ==========================================================
  @Get('demandes/insights')
  @UseGuards(JwtAuthGuard, CommercialAdminGuard)
  async demandesInsights() {
    const demandes = await this.demandeRepository.find();

    const count = (arr: string[]) => {
      const map = new Map<string, number>();
      for (const raw of arr) {
        const key = (raw || '').trim();
        if (!key) continue;
        map.set(key, (map.get(key) || 0) + 1);
      }
      return Array.from(map.entries())
        .map(([nom, count]) => ({ nom, count }))
        .sort((a, b) => b.count - a.count);
    };

    const topProduits = count(demandes.map((d) => d.produit)).slice(0, 5);
    const topCategories = count(demandes.map((d) => d.categorie)).slice(0, 5);
    const topMarques = count(demandes.map((d) => d.marque)).slice(0, 5);
    const nonNotifieesCount = demandes.filter((d) => !d.emailNotified).length;

    const stats = {
      totalCount: demandes.length,
      nonNotifieesCount,
      topProduits,
      topCategories,
      topMarques,
    };

    const summary = await this.aiService.summarizeDemandInsights(stats);

    return {
      stats,
      summary:
        summary ||
        `${demandes.length} demande(s) enregistrée(s), dont ${nonNotifieesCount} encore non satisfaite(s). ` +
          (topProduits[0]
            ? `La pièce la plus demandée est "${topProduits[0].nom}" (${topProduits[0].count} demande(s)).`
            : ''),
      source: summary ? ('ai' as const) : ('fallback' as const),
    };
  }
}
