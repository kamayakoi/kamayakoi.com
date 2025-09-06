import {Rule} from 'sanity'

export default {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'color',
      title: 'Badge Color',
      type: 'string',
      options: {
        list: [
          {title: 'Red', value: 'red'},
          {title: 'Amber', value: 'amber'},
          {title: 'Cyan', value: 'cyan'},
          {title: 'Teal', value: 'teal'},
          {title: 'Sky', value: 'sky'},
          {title: 'Pink', value: 'pink'},
          {title: 'Purple', value: 'purple'},
          {title: 'Yellow', value: 'yellow'},
          {title: 'Emerald', value: 'emerald'},
          {title: 'Blue', value: 'blue'},
        ],
        layout: 'radio',
      },
      initialValue: 'teal',
      description: 'Choose a color for the category badge',
    },
  ],
}
