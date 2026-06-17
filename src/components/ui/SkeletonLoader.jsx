export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const Card = () => (
    <div className="glass rounded-3xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-32 rounded-full shimmer" />
          <div className="h-3 w-24 rounded-full shimmer" />
        </div>
      </div>
      <div className="h-48 rounded-2xl shimmer" />
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded-full shimmer" />
        <div className="h-3 w-3/4 rounded-full shimmer" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-6 w-16 rounded-full shimmer" />
        ))}
      </div>
    </div>
  );

  const Profile = () => (
    <div className="space-y-4">
      <div className="h-40 w-full rounded-3xl shimmer" />
      <div className="flex items-end gap-4 px-5 -mt-10">
        <div className="w-20 h-20 rounded-full shimmer border-4 border-cream" />
        <div className="flex-1 space-y-2 pb-2">
          <div className="h-5 w-40 rounded-full shimmer" />
          <div className="h-3.5 w-28 rounded-full shimmer" />
        </div>
      </div>
    </div>
  );

  const Row = () => (
    <div className="flex items-center gap-4 p-4 glass rounded-2xl">
      <div className="w-10 h-10 rounded-full shimmer shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-full rounded-full shimmer" />
        <div className="h-3 w-2/3 rounded-full shimmer" />
      </div>
    </div>
  );

  const types = { card: Card, profile: Profile, row: Row };
  const Component = types[type] || Card;

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => <Component key={i} />)}
    </div>
  );
}
