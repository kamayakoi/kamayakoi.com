import {defineType, defineField} from 'sanity'
import {HomeIcon} from '@sanity/icons'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  // Uncomment limiter if using @sanity/document-internationalization
  // __experimental_actions: [/* 'create', */ 'update', /* 'delete', */ 'publish'],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Homepage',
      readOnly: true, // Make title read-only for singleton
    }),
    defineField({
      name: 'musicTracks',
      title: 'Music Tracks',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Track Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'artist',
              title: 'Artist',
              type: 'string',
            }),
            defineField({
              name: 'audioFile',
              title: 'Audio File',
              type: 'file',
              options: {accept: 'audio/*'},
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'coverImage',
              title: 'Cover Image',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
          ],
          preview: {
            select: {
              title: 'title',
              artist: 'artist',
              media: 'coverImage',
            },
            prepare({title, artist, media}) {
              return {
                title: title || 'Untitled Track',
                subtitle: artist || 'Unknown Artist',
                media,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(10),
      description:
        'Upload up to 10 music tracks to play on the homepage. Each track should have a title, audio file, and optionally an artist name and cover image.',
    }),
    defineField({
      name: 'promoEvent',
      title: 'Promoted Event (for Homepage Floating flyer)',
      type: 'reference',
      to: [{type: 'event'}],
      description:
        "Select an event to feature in the floating promo on the homepage. The event's flyer will be used as the image, and the promo will link to the event page.",
    }),
    defineField({
      name: 'featuredEvents',
      title: 'Featured Events for Hero Carousel',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'event'}],
        },
      ],
      description:
        'Select events to feature in the hero section carousel. These will appear alongside videos and images.',
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: 'audioPlayerEnabled',
      title: 'Enable Audio Player',
      type: 'boolean',
      initialValue: true,
      description: 'Show/hide the mini audio player in the header',
    }),
    defineField({
      name: 'autoPlayMusic',
      title: 'Auto-play Music on Page Load',
      type: 'boolean',
      initialValue: false,
      description: 'Automatically start playing music when visitors land on the site',
    }),
    defineField({
      name: 'heroContent',
      title: 'Hero Section Content',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'heroItem',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Main title to display in the hero section',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              description: 'Subtitle or description text',
            }),
            defineField({
              name: 'type',
              title: 'Media Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Image', value: 'image'},
                  {title: 'Video', value: 'video'},
                ],
                layout: 'radio',
              },
              initialValue: 'image',
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
              hidden: ({parent}) => parent?.type !== 'image',
              fields: [
                {
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'caption',
                  title: 'Caption',
                  type: 'string',
                },
              ],
            }),
            defineField({
              name: 'video',
              title: 'Video',
              type: 'file',
              options: {accept: 'video/*'},
              hidden: ({parent}) => parent?.type !== 'video',
              description: 'Upload a video file for the hero section',
            }),
            defineField({
              name: 'videoUrl',
              title: 'Video URL',
              type: 'url',
              hidden: ({parent}) => parent?.type !== 'video',
              description: 'External video URL (YouTube, Vimeo, etc.)',
            }),
            defineField({
              name: 'isActive',
              title: 'Active',
              type: 'boolean',
              initialValue: true,
              description: 'Show this hero item on the homepage',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              type: 'type',
              image: 'image',
              isActive: 'isActive',
            },
            prepare({title, type, image, isActive}) {
              return {
                title: title || 'Untitled Hero Item',
                subtitle: `${type} • ${isActive ? 'Active' : 'Inactive'}`,
                media: image,
              }
            },
          },
        },
      ],
      description: 'Hero section content - supports multiple items for carousel/slideshow',
      validation: (Rule) => Rule.max(5),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      firstTrack: 'musicTracks.0.title',
      promoEventTitle: 'promoEvent.title',
      heroItems: 'heroContent',
      featuredEvents: 'featuredEvents',
    },
    prepare({title, firstTrack, promoEventTitle, heroItems, featuredEvents}) {
      let previewTitle = title || 'Homepage Settings'

      const counts = []
      if (heroItems?.length) counts.push(`${heroItems.length} hero`)
      if (featuredEvents?.length) counts.push(`${featuredEvents.length} event`)

      if (counts.length > 0) {
        previewTitle += ` (${counts.join(', ')})`
      }

      if (firstTrack) {
        previewTitle += ` • ♪ ${firstTrack}`
      }
      if (promoEventTitle) {
        previewTitle += ` • Promo: ${promoEventTitle}`
      }

      return {
        title: previewTitle,
        media: HomeIcon,
      }
    },
  },
})
