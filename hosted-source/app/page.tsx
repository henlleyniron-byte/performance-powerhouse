type HomeProps = {
  searchParams: Promise<{ share?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const share = Array.isArray(params.share) ? params.share[0] : params.share;
  const source = share === "1" ? "/index.html?share=1" : "/index.html";

  return (
    <main className="app-frame">
      <iframe
        className="command-centre"
        src={source}
        title="A/L Performance Powerhouse V4 Community Edition"
      />
    </main>
  );
}
