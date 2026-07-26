export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={index} className="text-2xl font-semibold md:text-3xl">
              {block.replace(/^##\s+/, "")}
            </h2>
          );
        }
        if (block.startsWith("### ")) {
          return (
            <h3 key={index} className="text-xl font-semibold">
              {block.replace(/^###\s+/, "")}
            </h3>
          );
        }
        if (/^[-*]\s/m.test(block)) {
          return (
            <ul key={index} className="list-disc space-y-2 pl-5 text-muted-foreground">
              {block
                .split("\n")
                .map((line) => line.replace(/^[-*]\s+/, ""))
                .map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
            </ul>
          );
        }
        return (
          <p key={index} className="leading-relaxed text-muted-foreground">
            {block}
          </p>
        );
      })}
    </div>
  );
}
