import SEO from "@/components/SEO";

const Privacy = () => {
  const updated = "May 14, 2026";
  return (
    <>
      <SEO
        title="Privacy Policy — Faydabook"
        description="How Faydabook handles your data. No accounts, no tracking, no ads. Reading progress and bookmarks are stored only on your device."
        path="/privacy"
      />
      <main className="px-5 py-8 lg:px-8 lg:py-12 max-w-3xl mx-auto">
        <article className="prose prose-emerald dark:prose-invert max-w-none">
          <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: {updated}</p>

          <p>
            Faydabook is a digital library of works from the Tijāniyya tradition. We
            built it to be simple, respectful of readers, and free of surveillance.
            This page explains exactly what data the app handles.
          </p>

          <h2>No accounts</h2>
          <p>
            Faydabook does not require you to register, log in, or provide any
            personal information to read books, bookmark pages, or listen to audio.
            We do not collect your name, email address, phone number, or any other
            identifying information.
          </p>

          <h2>What is stored on your device</h2>
          <p>
            The following data is stored locally in your browser or app storage and
            never leaves your device:
          </p>
          <ul>
            <li>Reading progress (last page per book)</li>
            <li>Bookmarks and your personal notes</li>
            <li>Favorites</li>
            <li>Theme (light / dark / system) and language preference</li>
            <li>Cached audio for offline listening</li>
          </ul>
          <p>
            Clearing your browser storage or uninstalling the app removes all of
            this data. We have no copy of it.
          </p>

          <h2>Book content and covers</h2>
          <p>
            Book metadata and cover images are loaded from our backend
            infrastructure (Supabase). These requests are anonymous and do not
            include any personal identifiers.
          </p>

          <h2>Text-to-speech (audio narration)</h2>
          <p>
            When you tap the listen / play button on a book, the text of that
            section is sent to our text-to-speech provider, ElevenLabs, to generate
            spoken audio. Only the book text is sent — no personal data. The
            generated audio is cached so the same passage does not need to be
            regenerated. See the{" "}
            <a href="https://elevenlabs.io/privacy" target="_blank" rel="noreferrer">
              ElevenLabs privacy policy
            </a>{" "}
            for their handling of these requests.
          </p>

          <h2>No analytics, no advertising, no tracking</h2>
          <p>
            Faydabook does not include third-party analytics, advertising SDKs,
            tracking pixels, or social-media trackers. We do not build user
            profiles. We do not sell or share data, because we do not collect it.
          </p>

          <h2>Children</h2>
          <p>
            Faydabook is suitable for general audiences, including readers under
            13. Because we do not collect personal information from any user, we do
            not knowingly collect personal information from children.
          </p>

          <h2>Permissions</h2>
          <p>
            On Android (Play Store install), the app may request standard
            permissions such as network access (to load book content and audio) and
            storage (to cache audio for offline listening). It does not request
            access to your contacts, location, camera, microphone, or files
            outside its own storage.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If this policy changes, the updated version will be published at this
            URL with a new "Last updated" date.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy can be sent to{" "}
            <a href="mailto:contact@faydabook.com">contact@faydabook.com</a>.
          </p>
        </article>
      </main>
    </>
  );
};

export default Privacy;
