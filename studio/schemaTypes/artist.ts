import {defineType, defineField} from 'sanity'
import {UsersIcon} from '@sanity/icons' // Optional: Add an icon

export default defineType({
  name: 'artist',
  title: 'Artist / Performer',
  type: 'document',
  icon: UsersIcon, // Optional icon
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      description: 'Unique identifier for the artist, used for URLs if needed.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Short Bio',
      type: 'text',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'socialLink',
      title: 'Social Media Link',
      type: 'url',
      description:
        'Link to their primary social media profile (e.g., Instagram, Twitter, Website).',
    }),
    defineField({
      name: 'isResident',
      title: 'Is Resident?',
      type: 'boolean',
      initialValue: false,
      description: 'Check if this artist is a resident for the event series or venue.',
    }),
    defineField({
      name: 'role',
      title: 'Role/Title',
      type: 'string',
      options: {
        list: [
          {title: 'Artist', value: 'artist'},
          {title: 'Resident', value: 'resident'},
          {title: 'Host', value: 'host'},
          {title: 'MC', value: 'mc'},
          {title: 'Producer', value: 'producer'},
          {title: 'DJ', value: 'dj'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'artist',
      description: 'Role or title of the artist in the collective.',
    }),
    defineField({
      name: 'socialHandle',
      title: 'Social Handle',
      type: 'string',
      description: 'Username without @ symbol (e.g., johndoe)',
      placeholder: 'johndoe',
    }),
    // Add any other relevant fields for artists here
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
    prepare({title, media}) {
      return {
        title: title,
        media: media,
      }
    },
  },
})
