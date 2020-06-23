// animations
(function($) {
  var unique = function (array) {
    return $.grep(array, function(el, index) {
      return index === $.inArray(el, array);
    });
  }

  var DataFilter = function() {
    var DEFAULT_SELECTOR = '[data-filter]',
      DEFAULT_OPTIONS_SELECTOR = 'filterOptions',
      DEFAULT_OPTIONS = {
        linksWrap: '[data-links]',
        itemSelector: '[data-item]',
        filterBy: '[data-value]',
        linkStructure: '<span data-filter-id="%id%" data-filter-value="%value%">%text%</span>'
      },
      DATA_FILTER_STATE = {
        instantiated: false,
        selector: DEFAULT_SELECTOR,
        references: []
      }
    
    var getReferenceById = function(id) {
      var filter = $.grep(DATA_FILTER_STATE.references, function(el, index) {
        return el.id === id;
      });
      
      return filter[0];
    }
    
    var getDataItems = function(id) {
      var reference = getReferenceById(id),
        options = reference.options,
        items = reference.$element.find(options.itemSelector);
        
      return items;
    }
    
    
    var onClick = function(event) {
      var $target = $(event.target),
        data = $target.data(),
        options = getReferenceById(data.filterId).options,
        items = getDataItems(data.filterId);
      
      if($target.is('[data-selected]')) {
        $target.removeAttr('data-selected');
        
        for (var i = 0; i < items.length; i++) {
          var $item = $(items[i]);
          
          $item.removeAttr('data-filtered-out');
        }
      } else {
        $target.attr('data-selected', true);
        $target.siblings().removeAttr('data-selected');
        
        for (var i = 0; i < items.length; i++) {
          var $item = $(items[i]),
            value = $item.attr(options.filterBy);
          
          if(value !== data.filterValue)
            $item.attr('data-filtered-out', true);
          else
            $item.removeAttr('data-filtered-out');
        }
      }
    }
    
    var setupEventHandlers = function() {
      var references = DATA_FILTER_STATE.references,
        linksWrap = [];
        
      for (var i = 0; i < references.length; i++) {
        var reference = references[i];
        
        linksWrap.push(reference.options.linksWrap);
      }
        
      $(linksWrap.join(',')).on('click', 'span[data-filter-value]', onClick);
      $(window).on('unload', function() {
        $(linksWrap.join(',')).off('click', 'span[data-filter-value]', onClick);
      });
    }
    
    var setupLinks = function() {
      var references = DATA_FILTER_STATE.references,
        values = [];
        
      for (var i = 0; i < references.length; i++) {
        var reference = references[i],
          $element = reference.$element,
          id = reference.id,
          options = reference.options,
          values = [];
        
        $element.find(options.itemSelector).each(function(index, value) {
          var $value = $(value);
          
          values.push($value.attr(options.filterBy));
        });
        
        values = unique(values);
        
        elements = [];
        for (var i = 0; i < values.length; i++) {
          var value = values[i],
            link = options.linkStructure.replace(/%value%/g, value).replace(/%id%/g, id);
            
          elements.push(link);
        }
        
        $element.find(options.linksWrap).append(elements);
      }
    }
    
    return {
      instantiate(selector) {
        if(typeof selector === 'undefined')
          selector = DEFAULT_SELECTOR;
        
        $(selector).each(function(index, value) {
          var $element = $(value),
            options = $.extend(DEFAULT_OPTIONS, $element.data().filterOptions);

          DATA_FILTER_STATE.references.push({$element: $element, options: options, id: $element.attr('data-filter')});
        });
        
        DATA_FILTER_STATE.instantiated = true;
        DATA_FILTER_STATE.selector = selector;
        
        setupEventHandlers();
        setupLinks();
      }
    }
  }
  var RandomBackgroundColor = function() {
    var DEFAULT_COLORS = ["cc2936", "71a9f7", "2a2b2a", "eac435"],
      DEFAULT_SELECTOR = '[data-random-background="true"]';
    
    var GetBrightness = function(color) {
      var rgb = parseInt(color, 16),
        r = (rgb >> 16) & 0xff,
        g = (rgb >>  8) & 0xff,
        b = (rgb >>  0) & 0xff;

      var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      return luma;
    }
    
    return {
      instantiate: function(selector) {
        if(typeof selector === 'undefined')
          selector = DEFAULT_SELECTOR;
        
        $(selector).each(function(index, value) {
          var color = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
            $element = $(value);
          
          $element.css({backgroundColor: '#' + color});
          $element.attr({'data-background-color': color});
          
          if(GetBrightness(color) < 50) {
            $element.attr({'data-dark-background': true});
          }
        });
      }
    }
  }
  
  var ANIMATION_DEFINITION = {
      fadeIn: {
        from: function(options) {
          return {
            opacity: 0,
          }
        },
        to: function(options) {
          return {
            opacity: 1,
          }
        },
        step: function (element, context) {
          element.css({opacity: context.opacity});
        },
        getResetCSS: function(options) {
          return {
            opacity: this.from(options).opacity
          }
        }
      },
      slideIn: {
        from: function(options) {
          var translateX;
          
          switch (options.direction) {
            case 'left-to-right':
              translateX = -100;
              break;
            default:
            case 'right-to-left':
              translateX = 100;
              break;
          }
          
          return {
            translateX: translateX
          }
        },
        to: function(options) {
          return {
            translateX: 0
          }
        },
        step: function(element, context) {
          element.css({transform: 'translateX(' + context.translateX + '%)'})
        },
        getResetCSS: function(options) {
          return {
            transform: 'translateX(' + this.from(options).translateX + '%)'
          }
        }
      },
      diagonalSlideIn: {
        from: function(options) {
         
          var translateX,
            translateY = 100;
          
          switch (options.direction) {
            case 'bottom-left-to-top-right':
              translateX = -100;
              break;
            case 'bottom-right-to-top-left':
              translateX = 100;
              break;
            case 'bottom-center-to-top-center':
              translateX = 0;
              break;
          }
            
          return {
            translateX: translateX,
            translateY: translateY,
          }
        },
        to: function(options) {
          return {
            translateX: 0,
            translateY: 0,
          }
        },
        step: function(element, context) {
          element.css({transform: 'translate(' + context.translateX + '%, ' + context.translateY + '%)'})
        },
        getResetCSS: function(options) {
          var from = this.from(options);
          return {
            'transform': 'translate(' + from.translateX + '%, ' + from.translateY + '%)'
          }
        }
      }
    };
    
  var DEFAULT_ANIMATION_OPTIONS = { duration: '300ms' };
  var AnimationProcessor = function() {
    var shouldAnimateElement = function ($element) {
        var el = $element[0],
          rect = el.getBoundingClientRect(),
          page = {
            top: document.documentElement.scrollTop,
            clientHeight: document.documentElement.clientHeight
          };
            
        return (
          (rect.top - page.top - page.clientHeight <= 0)
        );
      },
      render = function($element, data) {
        var animation = ANIMATION_DEFINITION[data.animation],
          duration = ANIMATION_DEFINITION[data.duration],
          from = animation.from(data.animationOptions),
          to = animation.to(data.animationOptions)
          resetCSS = animation.getResetCSS(data.animationOptions);
          
        var visible = shouldAnimateElement($element);
        
        if (visible && !$element.animated) {
          $(from).animate(to, {
            duration: duration,
            step: function (now) {
              animation.step($element, this);
            },
            complete: function() {
              $element.animated = true;
            }
          });
        } else if (!visible) {
          $element.css(resetCSS);
          $element.animated = false;
        }
      };
        
    return {
      process($element, data) {
        if(typeof data === 'undefined')
          data = $element.data();
      
        var data = $.extend(DEFAULT_ANIMATION_OPTIONS, data);
        render($element, data);
      }
    }
  };
  
  var Animator = function() {
    var DEFAULT_SELECTOR = '[data-animation]',
      DEFAULT_ANIMATION = 'fadeIn',
      ANIMATOR_STATE = {
        instantiated: false,
        selector: DEFAULT_SELECTOR,
        $references: []
      };

    var render = function() {
        for (var i = 0; i < ANIMATOR_STATE.$references.length; i++) {
          $reference = ANIMATOR_STATE.$references[i];
          AnimationProcessor().process($reference);
        }
      };

    return {
      instantiate: function(selector) {
        if(typeof selector === 'undefined')
          selector = DEFAULT_SELECTOR;
        
        $(selector).each(function(index, value) {
          ANIMATOR_STATE.$references.push($(value));
        });
        
        ANIMATOR_STATE.instantiated = true;
        ANIMATOR_STATE.selector = selector;
        
        render();
        $(document).on('scroll', render);
        $(window).on('resize', render);
        $(window).on('unload', function() {
          $(document).off('scroll', render);
          $(window).off('resize', render);
        });
      }
    }
  }
  $(document).ready(function() {
    Animator().instantiate();
    RandomBackgroundColor().instantiate();
    DataFilter().instantiate();
  });
})(jQuery);
 


// shrink e menu
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    document.getElementById("navbar").style.padding = "10px 0px";
    document.getElementById("logo").style.fontSize = "24px";
  } else {
    document.getElementById("navbar").style.padding = "25px 0px";
    document.getElementById("logo").style.fontSize = "28px";
  }
}

// gallery breadcrumbs codes

$(document).ready(function () {
  $(".all-filter").click(function () {
    $(".all").show("slow");
  });
});
$(document).ready(function () {
  $(".filter-pro").click(function () {
    $("#pro").toggleClass("text-info");
    $("#new,#all,#free").removeClass("text-info");
    $(".all").show("slow");
    $(".pro").fadeOut("slow");
  });
});
$(document).ready(function () {
  $(".filter-new").click(function () {
    $("#new").toggleClass("text-info");
    $("#free,#pro,#all").removeClass("text-info");
    $(".all").show("slow");
    $(".new").hide("slow");
  });
});
$(document).ready(function () {
  $(".filter-free").click(function () {
    $("#free").toggleClass("text-info");
    $("#all,#pro,#new").removeClass("text-info");
    $(".all").show("slow");
    $(".free").fadeOut("slow");
  });
});


  