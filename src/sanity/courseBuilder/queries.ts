// GROQ used only by the Course Builder tool. Deliberately self-contained
// (not shared with src/lib/queries.ts, which drives the public site) —
// this dereferences just enough asset data for the builder's own compact
// editing UI (thumbnails, filenames) and includes `published` so the tool
// can show draft status, none of which the public site queries need.

export const COURSE_LIST_QUERY = `*[_type == "course"] | order(order asc){
  _id,
  title,
  "slug": slug.current,
  published
}`

export const COURSE_BUILDER_DETAIL_QUERY = `*[_type == "course" && _id == $id][0]{
  _id,
  _rev,
  title,
  "slug": slug.current,
  published,
  modules[]{
    _key,
    title,
    summary,
    lessons[]{
      _key,
      title,
      durationMinutes,
      isFreePreview,
      content[]{
        _key,
        _type,
        _type == "videoBlock" => {
          title,
          provider,
          cloudflareVideoId,
          externalUrl,
          "posterImageUrl": posterImage.asset->url
        },
        _type == "textBlock" => {
          content
        },
        _type == "pdfBlock" => {
          title,
          preventDownload,
          "fileUrl": file.asset->url,
          "fileName": file.asset->originalFilename
        },
        _type == "youtubeEmbedBlock" => {
          title,
          url
        },
        _type == "imageSlideBlock" => {
          caption,
          "imageUrl": image.asset->url
        }
      }
    }
  }
}`
