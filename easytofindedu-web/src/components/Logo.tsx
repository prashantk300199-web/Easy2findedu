import { Link } from 'react-router-dom';
import { cx } from '../lib/format';

/*
 * The supplied logo is a 1121×944 JPEG with a light plate (rgb 247,248,250)
 * baked in — no alpha. Scanning the bitmap puts the book-and-magnifier mark at
 * x 166–965, y 41–771, with a clean gap before the wordmark at y 771–800.
 * We window just the mark and set the brand type live, so it stays crisp at
 * any size instead of shipping a bitmap wordmark.
 */
const CROP = {
  left: 166 / 1121,
  top: 41 / 944,
  width: (965 - 166) / 1121,
  height: (771 - 41) / 944,
};
const IMG_RATIO = 944 / 1121;

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  // Scale the whole bitmap so the cropped mark is exactly `size` tall, then
  // window it. Deriving the box from crop fractions directly is wrong — they
  // are fractions of different bases (image width vs image height).
  const imgH = size / CROP.height;
  const imgW = imgH / IMG_RATIO;
  const boxW = CROP.width * imgW;

  return (
    <span
      className={cx('block shrink-0 overflow-hidden', className)}
      style={{ width: boxW, height: size }}
      aria-hidden
    >
      <img
        src="/logo.jpg"
        alt=""
        style={{
          width: imgW,
          maxWidth: 'none',
          marginLeft: -CROP.left * imgW,
          marginTop: -CROP.top * imgH,
        }}
      />
    </span>
  );
}

/**
 * Full lockup. On cream surfaces the mark multiplies so its grey plate
 * disappears; on navy it sits on a cream chip, which reads as deliberate.
 */
export function Wordmark({ light = false, size = 40 }: { light?: boolean; size?: number }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3">
      <span
        className={cx(
          'inline-flex items-center justify-center transition-transform duration-700 ease-editorial group-hover:scale-[1.06]',
          light ? 'bg-cream-100 p-1.5' : '',
        )}
      >
        <LogoMark size={size} className={light ? '' : 'mix-blend-multiply'} />
      </span>

      <span className="flex flex-col leading-none">
        <span className="font-display text-[19px] tracking-tight">
          <span className={light ? 'text-cream-100' : 'text-night-800'}>EasyToFind</span>
          <span className="text-gold-500">Edu</span>
        </span>
        <span className={cx('mt-1.5 text-[8px] uppercase tracking-overline', light ? 'text-gold-400' : 'text-gold-700')}>
          Trusted Platform
        </span>
      </span>
    </Link>
  );
}
