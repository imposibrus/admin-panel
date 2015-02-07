
var models = require('./models');

module.exports = {
  fieldActions: [
    {
      type: 'link',
      text: 'Edit',
      classes: 'btn btn-default',
      //target: '_blank',
      href: function(collectionsName) {return '/admin/edit/'+ collectionsName +'/' + this.id;}
    },
    {
      html: function(collectionsName) {return '<a href="/admin/delete/'+ collectionsName +'/'+ this.id +'">Delete</a>';}
    }
  ],
  listActions: [
    {
      html: function(collectionsName) {return '<a href="/admin/edit/'+ collectionsName +'/new" class="btn btn-success">Add new</a>';}
    }
  ],
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
        //password: {
        //  type: "password",
        //  required: true,
        //  label: 'your password'
        //},
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
        ]
      }
    },
    {
      name: "albums",
      model: "Album",
      populate: ['user'],
      fields: {
        title: {
          type: "text",
          //required: true,
          label: 'Title'
        },
        text: {
          type: "textarea",
          //required: true,
          label: 'textarea'
        },
        rich: {
          type: "rich",
          //required: true,
          label: 'rich'
        },
        checkbox: {
          type: "checkbox",
          //required: true,
          label: 'checkbox',
          default: false
        },
        user: {
          type: 'select',
          label: 'Пользователь',
          options: function(done) {
            models.User.find({}).select('name').exec(function(err, foundUsers) {
              done(err, foundUsers.map(function(user) {
                return {val: user.id, title: user.name};
              }));
            });
          }
        },
        user_type: {
          type: 'select',
          label: 'Тип пользователя',
          options: [{val: 1, title: 'Первый тип'}, {val: 2, title: 'Второй тип'}]
        },
        photos: {
          type: 'image',
          originalField: 'url',
          array: false,
          preview: {
            field: 'preview'
          },
          watermark: true
        }
      },
      list: {
        fields: [
          {
            label: 'Title',
            field: 'title'
          },
          {
            label: 'text',
            field: 'text'
          },
          {
            label: 'rich',
            field: 'rich'
          },
          {
            label: 'checkbox',
            field: 'checkbox'
          },
          {
            label: 'user',
            field: 'user',
            populateField: 'name',
            populatedCollection: 'users'
          },
          {
            label: 'user_type',
            field: 'user_type'
          }
        ]
      }
    }
  ]
};
