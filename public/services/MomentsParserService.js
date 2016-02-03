var module = angular.module('MomentsParserService', []);

module.service('MomentsParserFunctional', function() {
    var defaultColor = '#00ee00';
    this.GetToken = function() {
        var res = [];
        for (var i = 0; i < 1003; i++) {
            res.push(Math.floor(Math.random() * 10000));
        }
        return res;
    };

    var GetId = function(token, id, size) {
        return token[id % token.length] % size;
    };

    this.GetColor = function(token, moments, totalLength, timeFromStart) {
        if (timeFromStart < 0 || !moments) {
            return tinycolor("rgb(29,30,45)").toHexString();
        }
        if (timeFromStart >= totalLength) {
            timeFromStart = totalLength;
        }
        var id = moments.length - 1;
        var nextStartAt = totalLength;
        for (var i = 0; i + 1 < moments.length; i++) {
            if (moments[i + 1].startAt > timeFromStart) {
                id = i;
                nextStartAt = moments[i + 1].startAt;
                break;
            }
        }
        var startAt = moments[id].startAt;
        var data = moments[id].data;
        timeFromStart -= startAt;

        switch (moments[id].type) {
            case 'singleColor':
            {
                return tinycolor(data.color).toHexString();
                break;
            }
            case 'colorToColor':
            {
                var length = nextStartAt - startAt;
                var coof1 = timeFromStart / length;
                var coof2 = (length - timeFromStart) / length;
                var color = {
                    r: data.color1.r * coof2 + data.color2.r * coof1,
                    g: data.color1.g * coof2 + data.color2.g * coof1,
                    b: data.color1.b * coof2 + data.color2.b * coof1
                };
                return tinycolor(color).toHexString();
                break;
            }
            case 'cycle':
            {
                if (timeFromStart <= data.duration) {
                    return tinycolor(data.colors[0]).toHexString();
                }
                var colorId = (Math.floor(timeFromStart / data.duration)) % data.colors.length;
                var prevColorId = (colorId - 1 + data.colors.length) % data.colors.length;
                var passedTime = timeFromStart % data.duration;
                if (passedTime >= data.smoothness) {
                    return tinycolor(data.colors[colorId]).toHexString();
                }
                var coof1 = passedTime / data.smoothness;
                var coof2 = (data.smoothness - passedTime) / data.smoothness;
                var color = {
                    r: data.colors[prevColorId].r * coof2 + data.colors[colorId].r * coof1,
                    g: data.colors[prevColorId].g * coof2 + data.colors[colorId].g * coof1,
                    b: data.colors[prevColorId].b * coof2 + data.colors[colorId].b * coof1
                };
                return tinycolor(color).toHexString();
                break;
            }
            case 'random':
            {
                if (timeFromStart <= data.duration) {
                    return tinycolor(data.colors[GetId(token, 0, data.colors.length)]).toHexString();
                }
                var colorId = Math.floor(timeFromStart / data.duration);
                var prevColorId = colorId - 1;
                colorId = GetId(token, colorId, data.colors.length);
                prevColorId = GetId(token, prevColorId, data.colors.length);
                var passedTime = timeFromStart % data.duration;
                if (passedTime >= data.smoothness) {
                    return tinycolor(data.colors[colorId]).toHexString();
                }
                var coof1 = passedTime / data.smoothness;
                var coof2 = (data.smoothness - passedTime) / data.smoothness;
                var color = {
                    r: data.colors[prevColorId].r * coof2 + data.colors[colorId].r * coof1,
                    g: data.colors[prevColorId].g * coof2 + data.colors[colorId].g * coof1,
                    b: data.colors[prevColorId].b * coof2 + data.colors[colorId].b * coof1
                };
                return tinycolor(color).toHexString();
                break;
            }
            case 'colorPlusBlink':
            {
                var block = Math.floor(timeFromStart / 5);
                if (token[block % token.length] % 1000 < data.blinkProbability) {
                    return tinycolor(data.color2).toHexString();
                }
                return tinycolor(data.color1).toHexString();
                break;
            }
            case 'wave':
            {
                var length = nextStartAt - startAt;
                return {
                    type: 'wave',
                    data: {
                        mainColor: tinycolor(data.color1),
                        done: timeFromStart / length,
                        type: data.type
                    }
                };
                break;
            }
            default:
                break;
        }
    };
    return this;
});