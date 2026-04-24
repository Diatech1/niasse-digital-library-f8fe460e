import { useEffect, useMemo, useState } from "react";
import { ruhAlAdabVerses, ruhAlAdabMeta } from "@/data/ruh-al-adab";
import { comprendreFaydhahSections } from "@/data/comprendre-faydhah";
import { loadKachifulAlbasSections, type KachifulSection } from "@/data/kachiful-albas";
import { loadKashifEnSections, type KashifEnSection } from "@/data/kashif-en";
import { wirdTidjaneSections } from "@/data/wird-tidjane";
import { stationsIslamSections } from "@/data/stations-islam";
import { adebDhikrSections } from "@/data/adeb-dhikr";
import { origineSoubhaSections } from "@/data/origine-soubha";
import { salatFatihiSections } from "@/data/salat-fatihi";
import { jawharatulKamalSections } from "@/data/jawharatul-kamal";
import { dhikrGroupeSections } from "@/data/dhikr-groupe";
import { fadailDhikrSections } from "@/data/fadail-dhikr";
import { priereShaykhIbrahimSections } from "@/data/priere-shaykh-ibrahim";
import { stationsDeenEnSections } from "@/data/stations-deen-en";
import { loadConditionsReglesSections, type ConditionsSection } from "@/data/conditions-regles";
import { loadIfadatouSections, type IfadatouSection } from "@/data/ifadatou-ahmediyya";
import { loadVolumeSections, type VolumeSection } from "@/data/volume-loader";

export interface BookSection {
  id: string;
  part?: string;
  chapter?: string;
  heading: string;
  content: string;
}

const volumeMap: Record<string, string> = {
  "volume-1-conditions": "/books/volume-1-conditions-rules.txt",
  "volume-2-liturgies": "/books/volume-2-liturgies-prayers.txt",
  "volume-3-ethics": "/books/volume-3-ethics-advice.txt",
  "volume-4-letters": "/books/volume-4-letters.txt",
  "volume-5-commentaries": "/books/volume-5-commentaries.txt",
  "volume-7-biography": "/books/volume-7-biography.txt",
  "volume-8-teachings": "/books/volume-8-other-teachings.txt",
};

/**
 * Loads & flattens a book's content into a unified BookSection[] array,
 * regardless of whether the underlying source is sync (in-memory data) or
 * async (lazy-loaded text files).
 */
export function useBookContent(contentModule?: string) {
  const [kashifEn, setKashifEn] = useState<KashifEnSection[]>([]);
  const [kachiful, setKachiful] = useState<KachifulSection[]>([]);
  const [conditions, setConditions] = useState<ConditionsSection[]>([]);
  const [ifadatou, setIfadatou] = useState<IfadatouSection[]>([]);
  const [volume, setVolume] = useState<VolumeSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!contentModule) return;

    if (contentModule === "kashif-en") {
      setIsLoading(true);
      loadKashifEnSections().then((s) => {
        if (!cancelled) { setKashifEn(s); setIsLoading(false); }
      });
    } else if (contentModule === "kachiful-albas") {
      setIsLoading(true);
      loadKachifulAlbasSections().then((s) => {
        if (!cancelled) { setKachiful(s); setIsLoading(false); }
      });
    } else if (contentModule === "conditions-regles") {
      setIsLoading(true);
      loadConditionsReglesSections().then((s) => {
        if (!cancelled) { setConditions(s); setIsLoading(false); }
      });
    } else if (contentModule === "ifadatou-ahmediyya") {
      setIsLoading(true);
      loadIfadatouSections().then((s) => {
        if (!cancelled) { setIfadatou(s); setIsLoading(false); }
      });
    } else if (volumeMap[contentModule]) {
      setIsLoading(true);
      loadVolumeSections(volumeMap[contentModule], contentModule).then((s) => {
        if (!cancelled) { setVolume(s); setIsLoading(false); }
      });
    }

    return () => { cancelled = true; };
  }, [contentModule]);

  const sections: BookSection[] = useMemo(() => {
    if (!contentModule) return [];

    switch (contentModule) {
      case "ruh-al-adab":
        return [{
          id: "ruh-al-adab-all",
          heading: ruhAlAdabMeta.title,
          content: ruhAlAdabVerses.map((v) => `${v.number}. ${v.text}`).join("\n"),
        }];
      case "comprendre-faydhah":
        return comprendreFaydhahSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "wird-tidjane":
        return wirdTidjaneSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "stations-islam":
        return stationsIslamSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "adeb-dhikr":
        return adebDhikrSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "origine-soubha":
        return origineSoubhaSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "salat-fatihi":
        return salatFatihiSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "jawharatul-kamal":
        return jawharatulKamalSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "dhikr-groupe":
        return dhikrGroupeSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "fadail-dhikr":
        return fadailDhikrSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "priere-shaykh-ibrahim":
        return priereShaykhIbrahimSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "stations-deen-en":
        return stationsDeenEnSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "kachiful-albas":
        return kachiful.map((s) => ({ id: s.id, part: s.part, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "kashif-en":
        return kashifEn.map((s) => ({ id: s.id, part: s.part, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "conditions-regles":
        return conditions.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      case "ifadatou-ahmediyya":
        return ifadatou.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
      default:
        if (volumeMap[contentModule]) {
          return volume.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
        }
        return [];
    }
  }, [contentModule, kashifEn, kachiful, conditions, ifadatou, volume]);

  return { sections, isLoading };
}
