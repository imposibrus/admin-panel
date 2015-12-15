
module.exports = {
  fieldActions: [
    {
      type: 'link',
      text: 'Edit',
      classes: 'btn btn-default',
      //target: '_blank',
      href: function(collectionsName) {
        return '/admin/edit/'+ collectionsName +'/' + this.id;
      }
    },
    {
      html: function(collectionsName) {
        return '<a href="/admin/delete/'+ collectionsName +'/'+ this.id +'" class="delete">Delete</a>';
      }
    }
  ],
  listActions: [
    {
      html: function(collectionsName) {
        return [
          '<a href="/admin/edit/'+ collectionsName +'/new" class="btn btn-success">Add new</a>',
          '<a href="/admin/sort/'+ collectionsName +'" class="btn btn-default">Sort</a>'
        ].join('');
      }
    }
  ],
  collections: [
    {
      name: 'users',
      model: 'User',
      label: 'Users collection',
      fields: {
        name: {
          type: 'text',
          required: true,
          label: 'First name'
        },
        surname: {
          type: 'text',
          label: 'Last name'
        },
        phone: {
          type: 'tel',
          label: 'Phone'
        },
        email: {
          type: 'email',
          label: 'Email'
        },
        photo: {
          type: 'image',
          label: 'Photo',
          originalField: 'original'
        }
      },
      list: {
        fields: [
          {
            label: 'First name',
            field: 'name'
          },
          {
            label: 'Last name',
            field: 'surname'
          },
          {
            label: 'Phone',
            field: 'tel'
          },
          {
            label: 'Email',
            field: 'email'
          },
          {
            label: 'Photo',
            value: function() {
              if(!this.image || !this.image.original) {
                return '';
              }

              return '<img src="'+ this.image.original +'" style="max-width: 300px;">';
            }
          }
        ]
      }
    }
  ]
};
