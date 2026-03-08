/**
 * Registry of all article/book content modules.
 * To add a new article, simply add an entry here — no changes needed in Reader.tsx.
 */

import type { ReactNode } from "react";

export interface ContentSection {
  id: string;
  part?: string;
  chapter?: string;
  heading: string;
  content: string;
}

export interface ContentModuleMeta {
  title: string;
  subtitle?: string;
  author?: string;
  translator?: string;
  transliteratedBy?: string;
  translators?: string;
  source?: string;
}

export interface ContentModuleEntry {
  meta: ContentModuleMeta;
  sections: ContentSection[];
}

// Lazy loaders for large async modules
export type ContentModuleLoader = () => Promise<ContentModuleEntry>;

// Sync modules registry
const syncRegistry: Record<string, () => ContentModuleEntry> = {};
// Async modules registry  
const asyncRegistry: Record<string, ContentModuleLoader> = {};

export function registerSyncModule(key: string, loader: () => ContentModuleEntry) {
  syncRegistry[key] = loader;
}

export function registerAsyncModule(key: string, loader: ContentModuleLoader) {
  asyncRegistry[key] = loader;
}

export function isAsyncModule(key: string): boolean {
  return key in asyncRegistry;
}

export function getSyncModule(key: string): ContentModuleEntry | null {
  const loader = syncRegistry[key];
  return loader ? loader() : null;
}

export function getAsyncModuleLoader(key: string): ContentModuleLoader | null {
  return asyncRegistry[key] || null;
}

export function hasModule(key: string): boolean {
  return key in syncRegistry || key in asyncRegistry;
}

// ====== Register all modules ======

// Comprendre la Faydhah
import { comprendreFaydhahSections, comprendreFaydhahMeta } from "@/data/comprendre-faydhah";
registerSyncModule("comprendre-faydhah", () => ({
  meta: { title: comprendreFaydhahMeta.title, author: comprendreFaydhahMeta.author, translator: comprendreFaydhahMeta.translator },
  sections: comprendreFaydhahSections,
}));

// Wird Tidjane
import { wirdTidjaneSections, wirdTidjaneMeta } from "@/data/wird-tidjane";
registerSyncModule("wird-tidjane", () => ({
  meta: { title: wirdTidjaneMeta.title, author: wirdTidjaneMeta.author },
  sections: wirdTidjaneSections,
}));

// Stations Islam
import { stationsIslamSections, stationsIslamMeta } from "@/data/stations-islam";
registerSyncModule("stations-islam", () => ({
  meta: { title: stationsIslamMeta.title, author: stationsIslamMeta.author },
  sections: stationsIslamSections,
}));

// Adeb Dhikr
import { adebDhikrSections, adebDhikrMeta } from "@/data/adeb-dhikr";
registerSyncModule("adeb-dhikr", () => ({
  meta: { title: adebDhikrMeta.title, source: adebDhikrMeta.source },
  sections: adebDhikrSections,
}));

// Origine Soubha
import { origineSoubhaSections, origineSoubhaMeta } from "@/data/origine-soubha";
registerSyncModule("origine-soubha", () => ({
  meta: { title: origineSoubhaMeta.title, source: origineSoubhaMeta.source },
  sections: origineSoubhaSections,
}));

// Salat Fatihi
import { salatFatihiSections, salatFatihiMeta } from "@/data/salat-fatihi";
registerSyncModule("salat-fatihi", () => ({
  meta: { title: salatFatihiMeta.title, source: salatFatihiMeta.source },
  sections: salatFatihiSections,
}));

// Jawharatul Kamal
import { jawharatulKamalSections, jawharatulKamalMeta } from "@/data/jawharatul-kamal";
registerSyncModule("jawharatul-kamal", () => ({
  meta: { title: jawharatulKamalMeta.title, source: jawharatulKamalMeta.source },
  sections: jawharatulKamalSections,
}));

// Dhikr Groupe
import { dhikrGroupeSections, dhikrGroupeMeta } from "@/data/dhikr-groupe";
registerSyncModule("dhikr-groupe", () => ({
  meta: { title: dhikrGroupeMeta.title, source: dhikrGroupeMeta.source },
  sections: dhikrGroupeSections,
}));

// Fadail Dhikr
import { fadailDhikrSections, fadailDhikrMeta } from "@/data/fadail-dhikr";
registerSyncModule("fadail-dhikr", () => ({
  meta: { title: fadailDhikrMeta.title, source: fadailDhikrMeta.source },
  sections: fadailDhikrSections,
}));

// Prière Shaykh Ibrahim
import { priereShaykhIbrahimSections, priereShaykhIbrahimMeta } from "@/data/priere-shaykh-ibrahim";
registerSyncModule("priere-shaykh-ibrahim", () => ({
  meta: { title: priereShaykhIbrahimMeta.title, author: priereShaykhIbrahimMeta.author, translator: priereShaykhIbrahimMeta.translator },
  sections: priereShaykhIbrahimSections,
}));

// Stations Deen EN
import { stationsDeenEnSections, stationsDeenEnMeta } from "@/data/stations-deen-en";
registerSyncModule("stations-deen-en", () => ({
  meta: { title: stationsDeenEnMeta.title, subtitle: stationsDeenEnMeta.subtitle, author: stationsDeenEnMeta.author, translator: stationsDeenEnMeta.translator },
  sections: stationsDeenEnSections,
}));

// Cheminement Tariqa 2
import { cheminementTariqa2Sections, cheminementTariqa2Meta } from "@/data/cheminement-tariqa-2";
registerSyncModule("cheminement-tariqa-2", () => ({
  meta: { title: cheminementTariqa2Meta.title, author: cheminementTariqa2Meta.author, source: cheminementTariqa2Meta.source },
  sections: cheminementTariqa2Sections,
}));

// Récit de Isa
import { recitIsaSections, recitIsaMeta } from "@/data/recit-isa";
registerSyncModule("recit-isa", () => ({
  meta: { title: recitIsaMeta.title, author: recitIsaMeta.author, source: recitIsaMeta.source },
  sections: recitIsaSections,
}));

// Sagesse Mariage
import { sagesseMariageSections, sagesseMariageMeta } from "@/data/sagesse-mariage";
registerSyncModule("sagesse-mariage", () => ({
  meta: { title: sagesseMariageMeta.title, author: sagesseMariageMeta.author, source: sagesseMariageMeta.source },
  sections: sagesseMariageSections,
}));

// Secret qui donne vie
import { secretDonneVieSections, secretDonneVieMeta } from "@/data/secret-donne-vie";
registerSyncModule("secret-donne-vie", () => ({
  meta: { title: secretDonneVieMeta.title, author: secretDonneVieMeta.author, source: secretDonneVieMeta.source },
  sections: secretDonneVieSections,
}));

// Connaissance du Fath
import { connaissanceFathSections, connaissanceFathMeta } from "@/data/connaissance-fath";
registerSyncModule("connaissance-fath", () => ({
  meta: { title: connaissanceFathMeta.title, author: connaissanceFathMeta.author, source: connaissanceFathMeta.source },
  sections: connaissanceFathSections,
}));

// Temps Wadhifa
import { tempsWadhifaSections, tempsWadhifaMeta } from "@/data/temps-wadhifa";
registerSyncModule("temps-wadhifa", () => ({
  meta: { title: tempsWadhifaMeta.title, author: tempsWadhifaMeta.author, source: tempsWadhifaMeta.source },
  sections: tempsWadhifaSections,
}));

// Chirk el Aghrad
import { chirkAghradSections, chirkAghradMeta } from "@/data/chirk-aghrad";
registerSyncModule("chirk-aghrad", () => ({
  meta: { title: chirkAghradMeta.title, author: chirkAghradMeta.author, source: chirkAghradMeta.source },
  sections: chirkAghradSections,
}));

// Épreuves Amour
import { epreuvesAmourSections, epreuvesAmourMeta } from "@/data/epreuves-amour";
registerSyncModule("epreuves-amour", () => ({
  meta: { title: epreuvesAmourMeta.title, author: epreuvesAmourMeta.author, source: epreuvesAmourMeta.source },
  sections: epreuvesAmourSections,
}));

// Soucis Prière
import { soucisPriereSections, soucisPriereMeta } from "@/data/soucis-priere";
registerSyncModule("soucis-priere", () => ({
  meta: { title: soucisPriereMeta.title, author: soucisPriereMeta.author, source: soucisPriereMeta.source },
  sections: soucisPriereSections,
}));

// Ifadat Extrait 2
import { ifadatExtrait2Sections, ifadatExtrait2Meta } from "@/data/ifadat-extrait-2";
registerSyncModule("ifadat-extrait-2", () => ({
  meta: { title: ifadatExtrait2Meta.title, author: ifadatExtrait2Meta.author, source: ifadatExtrait2Meta.source },
  sections: ifadatExtrait2Sections,
}));

// Ifadat Extrait 11
import { ifadatExtrait11Sections, ifadatExtrait11Meta } from "@/data/ifadat-extrait-11";
registerSyncModule("ifadat-extrait-11", () => ({
  meta: { title: ifadatExtrait11Meta.title, author: ifadatExtrait11Meta.author, source: ifadatExtrait11Meta.source },
  sections: ifadatExtrait11Sections,
}));

// Async modules (large books loaded from text files)
import { loadKashifEnSections, kashifEnMeta } from "@/data/kashif-en";
registerAsyncModule("kashif-en", async () => {
  const sections = await loadKashifEnSections();
  return {
    meta: { title: kashifEnMeta.title, subtitle: kashifEnMeta.subtitle, author: kashifEnMeta.author, translators: kashifEnMeta.translators },
    sections,
  };
});

import { loadKachifulAlbasSections, kachifulAlbasMeta } from "@/data/kachiful-albas";
registerAsyncModule("kachiful-albas", async () => {
  const sections = await loadKachifulAlbasSections();
  return {
    meta: { title: kachifulAlbasMeta.title, subtitle: kachifulAlbasMeta.subtitle, author: kachifulAlbasMeta.author, translators: kachifulAlbasMeta.translators },
    sections,
  };
});
