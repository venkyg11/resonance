const AmbientBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div
      className="ambient-blob animate-blob-float"
      style={{
        width: 600, height: 600, top: '-10%', left: '-10%',
        background: 'radial-gradient(circle, hsl(265 90% 60% / 0.3), transparent 70%)',
      }}
    />
    <div
      className="ambient-blob animate-blob-float animate-pulse-glow"
      style={{
        width: 500, height: 500, bottom: '-5%', right: '-5%',
        background: 'radial-gradient(circle, hsl(230 80% 60% / 0.25), transparent 70%)',
        animationDelay: '2s',
      }}
    />
    <div
      className="ambient-blob animate-blob-float"
      style={{
        width: 300, height: 300, top: '40%', right: '20%',
        background: 'radial-gradient(circle, hsl(280 70% 50% / 0.15), transparent 70%)',
        animationDelay: '4s',
      }}
    />
  </div>
);

export default AmbientBackground;
