import type { Post } from "@/content/site";
import { MediaPlaceholder } from "./MediaPlaceholder";
import { Tag } from "./Tag";

type PostCardProps = {
  post: Post;
  featured?: boolean;
};

export function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <article className={featured ? "md:max-lg:col-span-2" : undefined}>
      <a href={post.href} className="group block">
        <MediaPlaceholder
          kind="image"
          label="Article image"
          description={post.description}
          className={featured ? "aspect-[522/300]" : "aspect-[331/230]"}
        />
        <h3 className="mt-3.5 transition-colors group-hover:text-signal group-focus-visible:text-signal">
          {post.headline}
        </h3>
      </a>
      <div className="mt-2.5 flex items-center gap-3">
        <Tag>{post.tag}</Tag>
        <p className="type-label text-stone">{post.date}</p>
      </div>
    </article>
  );
}
