
var models = require('./models'),
    _ = require('lodash');

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
      html: function(collectionsName) {
        return [
          '<a href="/admin/edit/'+ collectionsName +'/new" class="btn btn-success">Add new</a>',
          '<a href="/admin/sort/'+ collectionsName +'" class="btn btn-default">Сортировать</a>'
        ].join('');
      }
    }
  ],
  collections: [
    {
      name: "districts",
      model: "District",
      label: 'Районы',
      fields: {
        title: {
          type: "text",
          required: true,
          label: 'Название',
          placeholder: 'Placeholder'
        },
        population: {
          type: "number",
          required: true,
          label: 'Население (тыс. человек)',
          placeholder: '252'
        },
        color: {
          type: "select",
          required: true,
          label: 'Цвет',
          options: [{val: 'red', title: 'Красный'}, {val: 'yellow', title: 'Желтый'}, {val: 'green', title: 'Зеленый'}]
        },
        size: {
          type: "select",
          required: true,
          label: 'Размер',
          options: [{val: 'very_big', title: 'Очень большой'}, {val: 'big', title: 'Большой'}, {val: 'normal', title: 'Нормальный'}, {val: 'small', title: 'Маленький'}]
        },
        rating: {
          type: "select",
          required: true,
          label: 'Рейтинг',
          options: [{val: 1}, {val: 2}, {val: 3}, {val: 4}, {val: 5}]
        }
      },
      list: {
        fields: [
          {
            label: 'Название',
            field: 'title'
          }
        ]
      }
    },
    {
      name: "areas",
      model: "Area",
      label: 'Области развития',
      fields: {
        title: {
          type: "text",
          required: true,
          label: 'Название'
        },
        image: {
          type: "image",
          label: 'Изображение',
          originalField: 'url'
        }
      },
      list: {
        fields: [
          {
            label: 'Название',
            field: 'title'
          },
          {
            label: 'Изображение',
            value: function() {
              if(!this.image || !this.image.url) {
                return '';
              }
              return '<img src="'+ this.image.url +'">';
            }
          }
        ]
      }
    },
    {
      name: "soviets",
      model: "Soviet",
      label: 'Экспертный совет',
      fields: {
        name: {
          type: "text",
          required: true,
          label: 'Имя'
        },
        position: {
          type: "text",
          required: true,
          label: 'Должность'
        },
        district: {
          type: 'select',
          label: 'Район',
          options: function(done) {
            models.District.find({}).select('title').exec(function(err, foundDistricts) {
              done(err, foundDistricts.map(function(district) {
                return {val: district.id, title: district.title};
              }));
            });
          }
        },
        image: {
          type: "image",
          label: 'Изображение',
          originalField: 'url',
          preview: {
            field: 'preview',
            width: 220,
            height: 214
          }
        }
      },
      list: {
        fields: [
          {
            label: 'Имя',
            field: 'name'
          },
          {
            label: 'Должность',
            field: 'position'
          },
          {
            label: 'Изображение',
            value: function() {
              if(!this.image || !this.image.preview) {
                return '';
              }
              return '<img src="'+ this.image.preview +'">';
            }
          }
        ]
      }
    },
    {
      name: "events",
      model: "Event",
      label: 'События',
      fields: {
        title: {
          type: "text",
          required: true,
          label: 'Заголовок'
        },
        text: {
          type: "rich",
          required: true,
          label: 'Текст'
        },
        link: {
          type: "text",
          label: 'Сслыка'
        },
        images: {
          type: "image",
          label: 'Изображения',
          array: true,
          originalField: 'url',
          preview: {
            field: 'preview',
            width: 220,
            height: 214
          }
        }
      },
      list: {
        fields: [
          {
            label: 'Заголовок',
            field: 'title'
          },
          {
            label: 'Текст',
            field: 'text'
          },
          {
            label: 'Сслыка',
            field: 'link'
          },
          {
            label: 'Изображение (первое)',
            value: function() {
              if(_.isEmpty(this.get('images'))) {
                return '';
              }
              return '<img src="'+ _.first(this.get('images')).preview +'">';
            }
          }
        ]
      }
    },
    {
      name: "comments",
      model: "Comment",
      label: 'Комментарии экспертов',
      populate: ['expert', 'project'],
      fields: {
        expert: {
          type: 'select',
          label: 'Эксперт',
          options: function(done) {
            models.Soviet.find({}).select('name').exec(function(err, foundExperts) {
              done(err, foundExperts.map(function(expert) {
                return {val: expert.id, title: expert.name};
              }));
            });
          }
        },
        project: {
          type: 'select',
          label: 'Проект',
          options: function(done) {
            models.Project.find({}).select('title').exec(function(err, foundProjects) {
              done(err, foundProjects.map(function(project) {
                return {val: project.id, title: project.title};
              }));
            });
          }
        },
        text: {
          type: 'textarea',
          label: 'Текст комментария'
        }
      },
      list: {
        fields: [
          {
            label: 'Эксперт',
            field: 'expert',
            populateField: 'name',
            populatedCollection: 'soviets'
          },
          {
            label: 'Проект',
            field: 'project',
            populateField: 'title',
            populatedCollection: 'projects'
          },
          {
            label: 'Текст',
            field: 'text'
          }
        ]
      }
    },
    {
      name: "projects",
      model: "Project",
      label: 'Проекты',
      populate: ['district', 'env_area'],
      fields: {
        title: {
          type: "text",
          required: true,
          label: 'Название'
        },
        desc: {
          type: "rich",
          //required: true,
          label: 'Описание'
        },
        solution: {
          type: "rich",
          //required: true,
          label: 'Решение'
        },
        result: {
          type: "rich",
          //required: true,
          label: 'Результат'
        },
        'user.name': {
          type: "text",
          label: 'Имя пользователя'
        },
        'user.phone': {
          type: "text",
          label: 'Телефон пользователя'
        },
        'user.email': {
          type: "text",
          label: 'Email пользователя'
        },
        district: {
          type: 'select',
          label: 'Район',
          options: function(done) {
            models.District.find({}).select('title').exec(function(err, foundDistricts) {
              done(err, foundDistricts.map(function(district) {
                return {val: district.id, title: district.title};
              }));
            });
          }
        },
        env_area: {
          type: 'select',
          label: 'Область развития',
          options: function(done) {
            models.Area.find({}).select('title').exec(function(err, foundAreas) {
              done(err, foundAreas.map(function(area) {
                return {val: area.id, title: area.title};
              }));
            });
          }
        },
        attachments: {
          type: "files_list",
          label: 'Вложения',
          urlField: 'url',
          nameField: 'fileName'
        },
        sponsors: {
          type: "inputs_list",
          label: 'Спонсоры'
        },
        pages_links: {
          type: "inputs_list",
          label: 'Ссылки проекта'
        },
        color: {
          type: "select",
          required: true,
          label: 'Цвет',
          options: [{val: 'red', title: 'Красный'}, {val: 'yellow', title: 'Желтый'}, {val: 'green', title: 'Зеленый'}]
        },
        size: {
          type: "select",
          required: true,
          label: 'Размер',
          options: [{val: 'very_big', title: 'Очень большой'}, {val: 'big', title: 'Большой'}, {val: 'normal', title: 'Нормальный'}, {val: 'small', title: 'Маленький'}]
        },
        images: {
          type: "image",
          label: 'Изображения',
          array: true,
          originalField: 'original',
          preview: {
            field: 'preview',
            width: 180,
            height: 180
          }
        },
        videos: {
          type: "files_list",
          label: 'Видео',
          urlField: 'url'
        },
        is_active: {
          type: "checkbox",
          label: 'Отображать?'
        },
        share_counter: {
          type: "text",
          required: true,
          label: 'Число в кружке (лайки в соц.сети)'
        },
        //rating: {
        //  type: "select",
        //  //required: true,
        //  label: 'Рейтинг',
        //  options: [{val: 1}, {val: 2}, {val: 3}, {val: 4}, {val: 5}],
        //  default: 0
        //},
        status: {
          type: "select",
          //required: true,
          label: 'Статус проекта',
          options: [{val: 0, title: 'Идея'}, {val: 1, title: 'Реализуемый'}]
        },
        'eula.significance': {
          type: "checkbox",
          label: 'Мой проект значим для города и Республики'
        },
        'eula.team': {
          type: "checkbox",
          label: 'У меня есть команда для реализации проекта'
        },
        'eula.resources': {
          type: "checkbox",
          label: 'У меня есть ресурсы и спонсоры'
        },
        'eula.repeat': {
          type: "checkbox",
          label: 'Мой проект можно повторить в других городах Республики'
        }
      },
      list: {
        fields: [
          {
            label: 'Название',
            field: 'title'
          },
          {
            label: 'Описание',
            value: function() {
              if(_.isEmpty(this.get('desc'))) {
                return '';
              }
              if(this.get('desc').length < 130) {
                return this.get('desc');
              }
              return this.get('desc').substr(0, 130) + '...';
            }
          },
          {
            label: 'Пользователь',
            value: function() {
              if(_.isEmpty(this.get('user'))) {
                return '';
              }
              return 'Имя: <b>'+ this.get('user.name') +'</b><br> Телефон: <b>'+ this.get('user.phone') +'</b><br> Е-майл: <b>'+ this.get('user.email') + '</b>';
            }
          },
          {
            label: 'Ссылки в соц.сети',
            field: 'social_links'
          },
          {
            label: 'Ссылки',
            field: 'pages_links'
          },
          {
            label: 'Спонсоры',
            field: 'sponsors'
          },
          {
            label: 'Район',
            field: 'district',
            populateField: 'title',
            populatedCollection: 'districts'
          },
          {
            label: 'Область развития',
            field: 'env_area',
            populateField: 'title',
            populatedCollection: 'areas'
          },
          {
            label: 'Изображение (первое)',
            value: function() {
              if(_.isEmpty(this.get('images'))) {
                return '';
              }
              return '<img src="'+ _.first(this.get('images')).preview +'">';
            }
          },
          {
            label: 'Вложения',
            value: function() {
              if(!this.get('attachments').length) {
                return '';
              }
              return this.get('attachments').map(function(file) {
                return '<a href="'+ file.url +'" target="_blank">'+ file.fileName +'</a>';
              }).join('<br>');
            }
          },
          {
            label: 'Отображать?',
            field: 'is_active'
          }
        ]
      }
    }
  ]
};
