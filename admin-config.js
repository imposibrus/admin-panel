
module.exports = {
  "collections": [
    {
      name: "users",
      "model": "User",
      "fields": {
        "name": {
          "type": "text",
          "required": true
        },
        "password": {
          "type": "password",
          "required": true
        }
      },
      list: [
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
          value: function() {return '<img src="'+ this.photos.preview +'" width="100px">';}
        }
      ]
    }
  ]
};
