import {defineType, defineField} from 'sanity'
import {HomeIcon} from '@sanity/icons'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon as any,
  // Uncomment limiter if using @sanity/document-internationalization
  // __experimental_actions: [/* 'create', */ 'update', /* 'delete', */ 'publish'],
  fields: [
    defineField({
      name: 'defaultShippingCost',
      title: 'Default shipping cost (F CFA)',
      type: 'number',
      description: 'Set the default shipping costs. Leave at 0 if shipping is free.',
      initialValue: 3000,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'promoEvent',
      title: 'Promoted Event',
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
        'Select events to feature in the hero section carousel. These will appear alongside videos and images that visitors can navigate through.',
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: 'primaryButtonColor',
      title: 'Primary button color',
      type: 'string',
      options: {
        list: [
          {title: 'Red', value: 'red'},
          {title: 'Rose', value: 'rose'},
          {title: 'Pink', value: 'pink'},
          {title: 'Fuchsia', value: 'fuchsia'},
          {title: 'Purple', value: 'purple'},
          {title: 'Violet', value: 'violet'},
          {title: 'Indigo', value: 'indigo'},
          {title: 'Blue', value: 'blue'},
          {title: 'Sky', value: 'sky'},
          {title: 'Cyan', value: 'cyan'},
          {title: 'Teal', value: 'teal'},
          {title: 'Emerald', value: 'emerald'},
          {title: 'Green', value: 'green'},
          {title: 'Lime', value: 'lime'},
          {title: 'Yellow', value: 'yellow'},
          {title: 'Amber', value: 'amber'},
          {title: 'Orange', value: 'orange'},
          {title: 'Stone', value: 'stone'},
          {title: 'Neutral', value: 'neutral'},
          {title: 'Zinc', value: 'zinc'},
          {title: 'Gray', value: 'gray'},
          {title: 'Slate', value: 'slate'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'teal',
      description:
        'Site-wide color for all primary buttons (hero, footer, cart, checkout, etc.). Changing this updates every button color in the site.',
    }),
    defineField({
      name: 'ticketsButtonLocation',
      title: 'Tickets Button Location',
      type: 'string',
      options: {
        list: [
          {title: 'Header', value: 'header'},
          {title: 'Hero Section', value: 'hero'},
        ],
        layout: 'radio',
      },
      initialValue: 'header',
      description:
        'Choose where to display the tickets button: in the header (next to cart/wishlist) or in the hero section (floating button)',
    }),
    defineField({
      name: 'showBlogInNavigation',
      title: 'Show Blog in Navigation',
      type: 'boolean',
      initialValue: true,
      description: 'Show or hide the blog/stories page link in the navigation menu',
    }),
    defineField({
      name: 'showArchivesInNavigation',
      title: 'Show Archives in Navigation',
      type: 'boolean',
      initialValue: true,
      description: 'Show or hide the archives/gallery page link in the navigation menu',
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
      promoEventTitle: 'promoEvent.title',
      heroItems: 'heroContent',
      featuredEvents: 'featuredEvents',
    },
    prepare({promoEventTitle, heroItems, featuredEvents}) {
      let previewTitle = 'Homepage'

      const counts = []
      if (heroItems?.length) counts.push(`${heroItems.length} hero`)
      if (featuredEvents?.length) counts.push(`${featuredEvents.length} event`)

      if (counts.length > 0) {
        previewTitle += ` (${counts.join(', ')})`
      }

      if (promoEventTitle) {
        previewTitle += ` • Promo: ${promoEventTitle}`
      }

      return {
        title: previewTitle,
        media: HomeIcon as any,
      }
    },
  },
})
