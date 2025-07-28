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
    // Add other homepage-specific fields here if needed
  ],
  preview: {
    select: {
      title: 'title',
      firstTrack: 'musicTracks.0.title',
      promoEventTitle: 'promoEvent.title',
    },
    prepare({title, firstTrack, promoEventTitle}) {
      let previewTitle = title || 'Homepage Settings'
      if (firstTrack) {
        previewTitle += ` (♪ ${firstTrack})`
      }
      if (promoEventTitle) {
        previewTitle += ` (Promo: ${promoEventTitle})`
      }
      return {
        title: previewTitle,
        media: HomeIcon,
      }
    },
  },
})
