import { describe, expect, it } from "vitest";
import { parseJawahirRasailSections } from "./jawahir-rasail-en";

describe("parseJawahirRasailSections", () => {
  it("keeps title, salutation, body, and signature inside the same counsel section", () => {
    const sample = `TITRE: Counsel #1: On Concealing the Secret

LETTER #1 FROM THE DISCOURSES: On Concealing the Secret
Translated by UNKNOWN
In the Name of Allah, The Most Gracious, The Most Merciful
As-Salaamu Alaykum wa Rahmatullahi Ta'ala wa Barakatuh.

This is the body of the letter.
It continues here.

Salaam.
Ibrahim ibn Al-Hajj Abdullahi al-Tijani
1348 AH / 1929 CE

TITRE: Counsel #2: On Observing the Obligations

Chapter: The Second Letter of the Counsels
In the Name of Allah, The Most Gracious, The Most Merciful
May the peace and blessings of Allah be upon our master Muhammad.

The second body begins here.
Written by Ibrahim b. al-Hajj Abdullah al-Tijani.
`;

    const sections = parseJawahirRasailSections(sample);

    expect(sections).toHaveLength(2);
    expect(sections[0].heading).toBe("Counsel #1: On Concealing the Secret");
    expect(sections[0].content).toContain("In the Name of Allah");
    expect(sections[0].content).toContain("As-Salaamu Alaykum");
    expect(sections[0].content).toContain("This is the body of the letter. It continues here.");
    expect(sections[0].content).toContain("Ibrahim ibn Al-Hajj Abdullahi al-Tijani");
    expect(sections[0].content).not.toContain("LETTER #1 FROM THE DISCOURSES");
    expect(sections[0].content).not.toContain("Translated by UNKNOWN");

    expect(sections[1].heading).toBe("Counsel #2: On Observing the Obligations");
    expect(sections[1].content).toContain("The second body begins here.");
    expect(sections[1].content).not.toContain("Chapter: The Second Letter of the Counsels");
  });
});