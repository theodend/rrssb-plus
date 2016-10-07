/*!
 Simple Responsive Social Sharing Buttons
*/

+(function(window, $, undefined) {
    'use strict';
    var defaults = {
      shrink: 0.8,
      regrow: 0.8,
      minRows: 1,
      maxRows: 2,
      maxPrefix: 0.3,
    };

    /**
     * Public function to configure all sets of buttons on the page.
     */
    window.rrssbConfigAll = function(settings) {
      $('.rrssb').each(function(){
         $(this).rrssbConfig(settings);
      });
    }

    /**
     * Public function to configure the set of buttons.
     * $(this) points to an instance of .rrssb
     */
    $.fn.rrssbConfig = function(settings) {
      var checkedSettings = $.extend({}, defaults);
      if (settings) {
        if (settings.shrink >= 0.2 && settings.shrink <= 1) checkedSettings.shrink = settings.shrink;
        if (settings.regrow >= 0.2 && settings.regrow <= 1) checkedSettings.regrow = settings.regrow;
        if (settings.minRows >= 1 && settings.minRows <= 99) checkedSettings.minRows = settings.minRows;
        if (settings.maxRows >= 1 && settings.maxRows <= 99) checkedSettings.maxRows = settings.maxRows;
        if (settings.maxPrefix >= 0 && settings.shrink <= 0.8) checkedSettings.maxPrefix = settings.maxPrefix;
      }
      $(this).data('settings', checkedSettings);
      rrssbFix.call(this);
    };

    /**
     * Store original attribute values.
     * $(this) points to an instance of .rrssb
     */
    var rrssbInit = function() {
      if (!$(this).data('settings')) {
        // Initialise default settings.
        $(this).data('settings', defaults);
      }

      // Store original values.
      var orig = {
        width: 0,
        buttons: 0,
        height: $('li', this).innerHeight(),
        fontSize: parseFloat($(this).css("font-size")),
        prefixWidth: $('.rrssb-prefix', this).innerWidth(),
      };

      $('li', this).each(function() {
        orig.width = Math.max(orig.width, $(this).innerWidth());
        orig.buttons++;
      });

      // Set all buttons to match width of largest.
      // This width stays no matter what sizing, but it may get constrained down by a max-width.
      // In the case where the buttons are in a float with no fixed width, having the full
      // width set on each button ensures that the float is able to grow back up from no-labels to having labels again.
      $('li', this).width(orig.width);

      $(this).data('orig', orig);
      return orig;
    }

    /**
     * Fix all sets of buttons on the page.
     */
    var fixAll = function(initial) {
      $('.rrssb').each(function(){
          rrssbFix.call(this);
      });
    }

    /**
     * Main recalculte sizes function.
     * $(this) points to an instance of .rrssb
     */
    var rrssbFix = function(initial) {
      var orig = $(this).data('orig');
      if (!orig) {
        orig = rrssbInit.call(this);
      }
      else if (initial) {
        return;
      }
      var settings = $(this).data('settings');
      var buttonWidth = orig.width;
      var buttons = orig.buttons;

      // Modern browsers have sub-pixel support, so an element can have a fractional width internally.
      // This can get rounded up in the result of innerWidth, so subtract 1px to get a safe width.
      var containerWidth = $(this).innerWidth() - 1;

      // The container can't shrink below the size of one button.
      // For small containers make sure we have small buttons.
      // After changing this we need to let the browser recalculate then run again.
      var mini = (containerWidth <= orig.width);
      var lastMini = $(this).data('mini');
      if (mini != lastMini) {
        $(this).data('mini', mini);

        if (mini) {
          $('li', this).width('');
          $(this).addClass('no-label');
        }
        else {
          $('li', this).width(orig.width);
        }

        timer = setTimeout(fixAll, 1);
        return;
      }

      var prefixWidth = orig.prefixWidth;
      if (prefixWidth > containerWidth * settings.maxPrefix) {
        prefixWidth = 0;
      }

      var maxButtonWidth = containerWidth / settings.shrink - prefixWidth;
      var buttonsPerRow = Math.floor(maxButtonWidth / buttonWidth);
      var rowsNeeded = Math.max(settings.minRows, Math.ceil(buttons / buttonsPerRow));

      // Fix labels.
      if (rowsNeeded > settings.maxRows) {
        $(this).addClass('no-label');
        // Without label, button is square so width equals original height.
        buttonWidth = orig.height;
        buttonsPerRow = Math.max(1, Math.floor(maxButtonWidth / buttonWidth));
        rowsNeeded = Math.max(settings.minRows, Math.ceil(buttons / buttonsPerRow));
      }
      else {
        $(this).removeClass('no-label');
      }

      // Set max width.
      buttonsPerRow = Math.ceil(buttons / rowsNeeded);
      var percWidth = Math.floor(10000 / buttonsPerRow) / 100;
      $('li', this).css('max-width', percWidth + '%');

      // Fix font size.
      var desiredWidth = buttonWidth * buttonsPerRow + prefixWidth;
      var scale = Math.min(1, containerWidth / desiredWidth);
      if (rowsNeeded > settings.minRows) {
        scale = Math.min(scale, settings.regrow);
      }

      if (scale < 1) {
        // Reduce font size.
        // Reduce calculated value slightly as browser size calculations have some rounding and approximation.
        var fontSize = orig.fontSize * scale * 0.95;
        $(this).css('font-size', fontSize + 'px');
      }
      else {
        $(this).css('font-size', '');
      }

      desiredWidth *= scale;
      if (containerWidth > desiredWidth) {
         // Set padding to ensure the buttons wrap evenly, for example 6 => 3+3 not 4+2.
         // Use a percentage to ensure that we don't have padding > size after a radical rescale.
        var padding = Math.floor(10000 * (containerWidth - desiredWidth) / containerWidth) / 100;
        $(this).css('padding-right', padding + '%');
      }
      else {
        $(this).css('padding-right', '');
      }
    };

    var popupCenter = function(url, title, w, h) {
      // Fixes dual-screen position                         Most browsers      Firefox
      var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
      var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

      var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
      var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

      var left = ((width / 2) - (w / 2)) + dualScreenLeft;
      var top = ((height / 3) - (h / 3)) + dualScreenTop;

      var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

      // Puts focus on the newWindow
      if (newWindow && newWindow.focus) {
        newWindow.focus();
      }
    };

    var timer;
    var delayedFixAll = function () {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(fixAll, 200);
    };

    /**
     * Ready function
     */
    $(document).ready(function(){
        // Register event listners
        $('.rrssb-buttons a.popup').click(function popUp(e) {
            popupCenter($(this).attr('href'), $(this).find('.rrssb-text').html(), 580, 470);
            e.preventDefault();
        });

        $(window).resize(delayedFixAll);
    });

})(window, jQuery);
