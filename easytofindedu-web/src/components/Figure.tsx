import { useState } from 'react';
import { cx, initials } from '../lib/format';

/**
 * Falls back to a gold monogram when a record has no usable image —
 * many college logos upstream are dummyimage.com placeholders.
 */
export function Figure({
  src,
  alt,
  name,
  ratio = 'aspect-[4/3]',
  className,
  zoom = true,
}: {
  src: string | null;
  alt: string;
  name: string;
  ratio?: string;
  className?: string;
  zoom?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showImage = src && !failed;

  return (
    <div className={cx('relative overflow-hidden bg-night-700', ratio, className)}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cx(
            // Listing photos are owner-uploaded and inconsistent; holding the
            // saturation back unifies a grid, and hover restores full colour.
            'h-full w-full object-cover saturate-[0.85] transition-all ease-editorial',
            loaded ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-sm',
            'duration-1200',
            zoom && 'group-hover:scale-[1.06] group-hover:saturate-100',
          )}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-night-700">
          <span className="font-display text-4xl text-gold-500/70">{initials(name)}</span>
        </div>
      )}
    </div>
  );
}
