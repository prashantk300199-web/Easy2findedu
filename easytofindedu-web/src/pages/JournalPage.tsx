import { fetchBlogs } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { imageUrl } from '../lib/format';
import { EmptyNote, ErrorNote, Section, Spinner } from '../components/primitives';
import { PageHero } from '../components/PageHero';
import { IMG } from '../lib/images';
import { Reveal } from '../components/motion';
import { Figure } from '../components/Figure';

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function JournalPage() {
  const { data, loading, error } = useAsync((signal) => fetchBlogs(50, signal), []);

  return (
    <>
      <PageHero
        eyebrow="Student Guides"
        titleLines={[<>Notes on</>, <><span className="gilded italic">choosing well.</span></>]}
        intro="Guidance on exams, admissions and the decisions that surround them."
        image={IMG.journalHero}
        stats={[
          { value: data?.length || '—', label: 'Guides' },
          { value: 'Free', label: 'To read' },
        ]}
      />
      <Section className="py-16 md:py-20">
      {loading && <Spinner label="Loading journal" />}
      {error && <div className="mt-12"><ErrorNote message={error} /></div>}

      {data && (data.length === 0 ? (
        <EmptyNote title="No articles yet." />
      ) : (
        <div className="mt-14 grid gap-x-8 gap-y-16 border-t border-night-800 pt-14 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((post, i) => (
            <Reveal key={post._id} delay={(i % 3) * 80}>
              <article className="group">
                <Figure src={imageUrl(post.coverImage)} alt={post.title} name={post.title} ratio="aspect-[3/2]" />
                <div className="mt-5 flex items-center gap-3 text-[11px] uppercase tracking-overline text-ink-400">
                  {post.category && <span className="text-gold-700">{post.category}</span>}
                  {formatDate(post.publishedAt) && <span>{formatDate(post.publishedAt)}</span>}
                </div>
                <h2 className="mt-3 font-display text-xl leading-snug text-ink">{post.title}</h2>
                {post.excerpt && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-500">{post.excerpt}</p>
                )}
                {post.authorName && <p className="mt-4 text-xs text-ink-400">By {post.authorName}</p>}
              </article>
            </Reveal>
          ))}
        </div>
      ))}
      </Section>
    </>
  );
}
