interface ElixirBarProps {
  elixir: number;
}

export function ElixirBar({ elixir }: ElixirBarProps) {
  const displayElixir = Math.floor(elixir);
  const fillPercent = (elixir / 10) * 100;

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-accent">⚡ Elixir</span>
        <span className="text-lg font-bold text-accent">{displayElixir}/10</span>
      </div>
      
      <div className="elixir-bar-container">
        <div
          className="elixir-bar-fill"
          style={{ width: `${fillPercent}%` }}
        />
        <div className="elixir-segments">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="elixir-segment" />
          ))}
        </div>
      </div>
    </div>
  );
}
