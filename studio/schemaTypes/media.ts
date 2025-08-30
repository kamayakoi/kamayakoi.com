import {defineType, defineField} from 'sanity'
import {PlayIcon} from '@sanity/icons'

export default defineType({
  name: 'media',
  title: 'Media Embed',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Display title for this media item',
    }),
    defineField({
      name: 'type',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          {title: 'YouTube Video', value: 'youtube'},
          {title: 'SoundCloud Track', value: 'soundcloud'},
          {title: 'SoundCloud Playlist', value: 'soundcloud_playlist'},
          {title: 'Direct Audio URL', value: 'audio_url'},
          {title: 'Direct Video URL', value: 'video_url'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
      description: 'Full URL to the media (YouTube, SoundCloud, or direct media URL)',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Optional description or caption for this media',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Custom Thumbnail',
      type: 'image',
      description: 'Optional custom thumbnail image (will use platform default if not provided)',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
        {
          name: 'caption',
          title: 'Caption',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Optional duration (e.g., "3:45" or "2:30:15")',
    }),
    defineField({
      name: 'artist',
      title: 'Artist/Creator',
      type: 'string',
      description: 'Artist name or content creator',
    }),
    defineField({
      name: 'genre',
      title: 'Genre/Category',
      type: 'string',
      description: 'Music genre, video category, etc.',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Feature this media item prominently',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Tags for organization and filtering',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When this media was published or added',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      artist: 'artist',
      thumbnail: 'thumbnail',
      url: 'url',
    },
    prepare({title, type, artist, thumbnail, url}) {
      const typeIcons: Record<string, string> = {
        youtube: '📺',
        soundcloud: '🎵',
        soundcloud_playlist: '📀',
        audio_url: '🎧',
        video_url: '🎬',
      }

      const getPlatform = (url: string) => {
        if (!url) return ''
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
        if (url.includes('soundcloud.com')) return 'SoundCloud'
        return 'Direct'
      }

      return {
        title: title || 'Untitled Media',
        subtitle: `${typeIcons[type] || '📺'} ${getPlatform(url)} ${artist ? `• ${artist}` : ''}`,
        media: thumbnail,
      }
    },
  },
})
