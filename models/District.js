
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    Q = require('q');

var districtsSchema = new Schema({
  title: {type: String, required: true},
  color: {type: String, required: true},
  size: {type: String, required: true},
  rating: {type: Number, required: true},
  population: {type: Number},
  order: {type: Number, index: true, default: 0}
});

districtsSchema.static('getOrdered', function(done) {
  this.find({}).sort({order: 1}).exec(function(err, foundDistricts) {
    if(err) {
      return done(err);
    }

    done(null, foundDistricts);
  });
});

districtsSchema.method('projectsCount', function(done) {
  mongoose.model('Project').count({district: this.id, is_active: true}).exec(done);
});

/**
 * getDistrictPopulationGroup
 * @param {Object} district
 * @returns {Number}
 */
var getDistrictPopulationGroup = function(district) {
  if(district.population >= 500) {
    return 1;
  } else if(district.population >= 100 && district.population < 500) {
    return 2;
  } else if(district.population >= 30 && district.population < 100) {
    return 3;
  } else if(district.population < 30) {
    return 4;
  }
};

/**
 * getDistrictShade
 * @param {Number} group
 * @param {Number} percent
 */
var getDistrictShade = function(group, percent) {
  if(group == 1 || group == 2) {
    if(percent <= 20) {
      return 0.2;
    } else if(percent > 20 && percent <= 60) {
      return 0.4;
    } else if(percent > 60 && percent <= 80) {
      return 0.6;
    } else if(percent > 80 && percent <= 100) {
      return 0.8;
    }
  } else if(group == 3) {
    if(percent <= 20) {
      return 0.4;
    } else if(percent > 20 && percent <= 60) {
      return 0.6;
    } else if(percent > 60 && percent <= 80) {
      return 0.8;
    } else if(percent > 80 && percent <= 100) {
      return 1;
    }
  } else if(group == 4) {
    if(percent <= 20) {
      return 0.6;
    } else if(percent > 20 && percent <= 60) {
      return 0.8;
    } else if(percent > 60 && percent <= 100) {
      return 1;
    }
  }
};

districtsSchema.method('districtColor', function(done) {
  var district = this;
  // FIXME: make more optimizing algorithm
  mongoose.model('Project').find({is_active: true}).exec(function(err, foundProjects) {
    if(err) {
      return done(err);
    }

    var sortedDistricts = _(foundProjects).countBy('district').map(function(num, district) {return {district: district, num: num};}).sortBy('num').value();
    var currentDistrict = _(sortedDistricts).find({district: district.id});
    if(!currentDistrict) {
      return done(null, 'rgba(80, 215, 89, '+ 0.1 +')');
    }

    var districtGroup = getDistrictPopulationGroup(district),
        percent = (currentDistrict.num * 100) / _(sortedDistricts).map('num').max(),
        shade = getDistrictShade(districtGroup, percent);

    done(null, 'rgba(80, 215, 89, '+ shade +')');
  });
});

districtsSchema.method('districtInfographic', function(done) {
  var district = this,
      out = {
        title: district.title,
        rating: district.rating,
        areas: []
      },
      colors = ['rgb(238,143,43)', 'rgb(225,203,67)', 'rgb(51,165,64)', 'rgb(55,146,229)', 'rgb(205,18,31)'],
      bgColors = ['rgba(238,143,43,.95)', 'rgba(225,203,67,.95)', 'rgba(51,165,64,.95)', 'rgba(55,146,229,.95)', 'rgba(205,18,31,.95)'],
      currColor = 0;

  district.projectsCount(function(err, count) {
    if(err) {
      return done(err);
    }

    out.projectsCount = count;

    mongoose.model('Project').find({district: district.id, is_active: true}).exec(function(err, foundProjects) {
      if(err) {
        return done(err);
      }

      var groupedByArea = _(foundProjects).groupBy('env_area').value(),
          promises = [];

      _.each(groupedByArea, function(projects, area_id) {
        var defer = Q.defer();

        mongoose.model('Area').findById(area_id).exec(function(err, foundArea) {
          if(err) {
            return done(err);
          }

          defer.resolve(foundArea);
        });

        promises.push(defer.promise);
      });

      Q.all(promises).done(function(areas) {
        areas.forEach(function(area) {
          var areaProjects = groupedByArea[area.id],
              color,
              bgColor;

          if(!colors[currColor]) {
            currColor = 0;
          }
          color = colors[currColor];
          bgColor = bgColors[currColor];

          var areaObj = {
            title: area.title,
            projectsCount: areaProjects.length,
            rating: Math.floor(_.sum(areaProjects.map(function(project) {return project.rating;})) / areaProjects.length),
            color: color,
            bgColor: bgColor,
            projects: areaProjects.map(function(project) {return _.pick(project, ['id', 'title', 'status']);})
          };

          out.areas.push(areaObj);
          currColor++;
        });
        done(null, out);
      }, function(err) {
        done(err);
      });
    });
  });
});

module.exports = mongoose.model('District', districtsSchema);
