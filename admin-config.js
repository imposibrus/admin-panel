
module.exports = {
  collections: [
    {
      name: "users",
      model: "User",
      fields: {
        name: {
          type: "text",
          required: true,
          label: 'Label Text',
          placeholder: 'Placeholder'
        },
        password: {
          type: "password",
          required: true,
          label: 'your password'
        },
        photos: {
          type: 'image',
          originalField: 'original',
          array: false,
          preview: {
            field: 'preview',
            sizes: [
              {
                width: 50,
                height: 50,
                watermark: false,
                field: '50'
              },
              {
                width: 100,
                height: 100,
                field: '100'
              }
            ]
          },
          watermark: true
        }
      },
      list: {
        fields: [
          {
            label: 'User name',
            field: 'name'
          },
          {
            label: 'User password',
            value: function() {return 'pass: ' + this.password;}
          },
          {
            label: 'Картинка!',
            value: function() {
              if(this.photos.original) {
                return '<img src="'+ this.photos.original +'" width="100px">';
              } else {
                return 'no image';
              }
            }
          }
        ],
        fieldActions: [
          {
            type: 'link',
            text: 'Edit',
            classes: 'btn btn-default',
            //target: '_blank',
            href: function() {return '/admin/edit/users/' + this.id;}
          },
          {
            html: function() {return '<a href="/admin/delete/users/'+ this.id +'">Delete</a>';}
          }
        ],
        listActions: [
          {
            html: '<a href="/admin/edit/users/new" class="btn btn-success">Add new</a>'
          }
        ]
      }
    }
  ]
};
