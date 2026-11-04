import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "@/components/ui/PostCard";
import { MIN_POSTS, POSTS } from "@/content/site";

export function Latest() {
  if (POSTS.length < MIN_POSTS) {
    return null;
  }

  return (
    <section id="latest" className="mt-24 scroll-mt-nav px-gutter md:mt-32 xl:mt-[204px]">
      <SectionHeading title="Latest" subtitle="Notes, launches and talks" />
      <div className="mt-10 grid max-w-[1208px] items-start gap-x-stack gap-y-8 md:grid-cols-2 lg:mt-[70px] lg:grid-cols-[522fr_331fr_331fr] lg:gap-y-0">
        {POSTS.map((post, i) => (
          <PostCard key={post.tag} post={post} featured={i === 0} />
        ))}
      </div>
    </section>
  );
}
